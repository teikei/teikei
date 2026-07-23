import { expect, test, type Page, type Route } from '@playwright/test';

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

function buildFarmFeature(id: string, name: string) {
	return {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [8.55, 47.37] },
		properties: {
			id,
			type: 'Farm' as const,
			name,
			postalcode: '8000',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			products: [],
			updatedAt: '2025-02-01T00:00:00.000Z'
		}
	};
}

function buildDepotFeature(id: string, name: string, farmId: string, farmName: string) {
	return {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [8.58, 47.39] },
		properties: {
			id,
			type: 'Depot' as const,
			name,
			postalcode: '8001',
			city: 'Zurich',
			address: 'Bahnhofstrasse 1',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			deliveryDays: '',
			farms: {
				type: 'FeatureCollection' as const,
				features: [buildFarmFeature(farmId, farmName)]
			},
			updatedAt: '2025-02-02T00:00:00.000Z'
		}
	};
}

async function mockAuthenticatedUser(page: Page) {
	await page.addInitScript(() => {
		window.localStorage.setItem('accessToken', 'test-token');
	});

	await page.route(/\/authentication(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			accessToken: 'test-token',
			user: {
				id: 'user-1',
				email: 'owner@example.com',
				name: 'Owner User'
			}
		})
	);
}

async function mockDepotCrudApi(page: Page) {
	const ownedFarm = buildFarmFeature('farm-owned', 'Owned Farm');
	const foreignFarm = buildFarmFeature('farm-foreign', 'Foreign Farm');
	let ownedDepot: ReturnType<typeof buildDepotFeature> | null = buildDepotFeature(
		'depot-owned',
		'Owned Depot',
		'farm-owned',
		'Owned Farm'
	);

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const url = new URL(route.request().url());
		const isMine = url.searchParams.get('mine') === 'true';
		if (isMine) {
			return fulfillJson(route, {
				type: 'FeatureCollection',
				features: ownedDepot ? [ownedDepot, ownedFarm] : [ownedFarm]
			});
		}

		return fulfillJson(route, {
			type: 'FeatureCollection',
			features: ownedDepot ? [ownedFarm, foreignFarm, ownedDepot] : [ownedFarm, foreignFarm]
		});
	});

	await page.route(/\/depots\/depot-owned(?:\/)?(?:\?.*)?$/, async (route) => {
		const method = route.request().method();
		if (method === 'PATCH') {
			const payload = JSON.parse(route.request().postData() ?? '{}');
			ownedDepot = buildDepotFeature(
				'depot-owned',
				payload.name ?? 'Owned Depot',
				'farm-owned',
				'Owned Farm'
			);
			await fulfillJson(route, ownedDepot);
			return;
		}

		if (method === 'DELETE') {
			const deleted =
				ownedDepot ?? buildDepotFeature('depot-owned', 'Owned Depot', 'farm-owned', 'Owned Farm');
			ownedDepot = null;
			await fulfillJson(route, deleted);
			return;
		}

		await fulfillJson(
			route,
			ownedDepot ?? buildDepotFeature('depot-owned', 'Owned Depot', 'farm-owned', 'Owned Farm')
		);
	});

	await page.route(/\/depots(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() !== 'POST') {
			return;
		}

		const payload = JSON.parse(route.request().postData() ?? '{}');
		ownedDepot = buildDepotFeature(
			'depot-created',
			payload.name ?? 'Created Depot',
			'farm-owned',
			'Owned Farm'
		);
		await fulfillJson(route, ownedDepot);
	});

	await page.route(/\/farms\/farm-owned(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, ownedFarm)
	);

	return {
		getOwnedDepotName: () => ownedDepot?.properties.name ?? 'Owned Depot Updated'
	};
}

test('create depot from my-entries returns to my-entries with success and associated farm action', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockDepotCrudApi(page);

	await page.route(/\/autocomplete(?:\/)?(?:\?.*)?$/, async (route) => {
		const body = route.request().postDataJSON() as { text?: string };
		if (body?.text?.toLowerCase().includes('zur')) {
			await fulfillJson(route, [
				{ id: 'loc-zurich', title: 'Zurich, Switzerland', type: 'location' }
			]);
			return;
		}
		await fulfillJson(route, []);
	});
	await page.route(/\/geocoder(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, { id: 'loc-zurich', city: 'Zurich', latitude: 47.39, longitude: 8.58 })
	);

	await page.goto('/#/myentries');
	await page.getByTestId('create-depot-action').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/depots/new');
	await expect(page.getByTestId('depot-editor')).toBeVisible({ timeout: 15000 });

	await page.getByTestId('depot-input-name').fill('Created Depot');
	await page.getByTestId('depot-input-geocoder').fill('Zurich');
	await page.getByText('Zurich, Switzerland').click();
	await expect(page.getByTestId('depot-input-geocoder')).toHaveValue('Zurich', { timeout: 15000 });

	// Farm association via the typeahead combobox, keyboard-only: filter, then
	// Enter selects the auto-highlighted first match, which renders as a chip.
	const farmsInput = page.getByTestId('depot-input-farms');
	await farmsInput.fill('Owned');
	await farmsInput.press('Enter');
	await expect(page.getByRole('button', { name: 'Entfernen: Owned Farm' })).toBeVisible({
		timeout: 15000
	});

	await page.getByTestId('depot-editor-save').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/myentries');
	expect(page.url()).not.toContain('depotAction');
	const createdToast = page
		.locator('[data-sonner-toast]')
		.filter({ hasText: 'Depot wurde gespeichert.' });
	await expect(createdToast).toBeVisible({ timeout: 15000 });
	await createdToast.locator('[data-button]').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned');
	await expect(page.getByRole('heading', { name: 'Owned Farm' })).toBeVisible({ timeout: 15000 });
});

test('depot editor farm combobox: mouse click selects an option and the chip is removable', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockDepotCrudApi(page);

	await page.goto('/#/myentries');
	await page.getByTestId('create-depot-action').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/depots/new');
	await expect(page.getByTestId('depot-editor')).toBeVisible({ timeout: 15000 });

	// Regression: pressing a non-focusable command option used to blur the input,
	// closing the list before the click could select. Open by click, then pick the
	// option with the mouse.
	await page.getByTestId('depot-input-farms').click();
	await page.getByRole('option', { name: 'Owned Farm' }).click();

	const chipRemove = page.getByRole('button', { name: 'Entfernen: Owned Farm' });
	await expect(chipRemove).toBeVisible({ timeout: 15000 });

	// The chip's remove control clears the selection.
	await chipRemove.click();
	await expect(chipRemove).toBeHidden();
});

test('depot editor farm combobox defaults to owned farms and reveals all once opted in', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockDepotCrudApi(page);

	await page.goto('/#/myentries');
	await page.getByTestId('create-depot-action').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/depots/new');
	await expect(page.getByTestId('depot-editor')).toBeVisible({ timeout: 15000 });

	const farmsInput = page.getByTestId('depot-input-farms');
	await farmsInput.click();
	await expect(page.getByRole('option', { name: 'Owned Farm' })).toBeVisible({ timeout: 15000 });
	await expect(page.getByRole('option', { name: 'Foreign Farm' })).toBeHidden();
	await farmsInput.press('Escape');

	await page.getByTestId('depot-input-connect-foreign-farms').click();
	await farmsInput.click();
	await expect(page.getByRole('option', { name: 'Foreign Farm' })).toBeVisible({ timeout: 15000 });
});

test('edit and delete depot in my-entries keep management context and show success feedback', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	const depotState = await mockDepotCrudApi(page);

	await page.goto('/#/myentries');

	const depotRow = page.getByTestId('entry-item').filter({ hasText: 'Owned Depot' }).first();
	await expect(depotRow).toBeVisible({ timeout: 15000 });
	await depotRow.getByTestId('entry-action-edit-inline').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/depots/depot-owned/edit');
	await expect(page.getByTestId('depot-editor')).toBeVisible({ timeout: 15000 });

	await page.getByTestId('depot-input-name').fill('Owned Depot Updated');
	await page.getByTestId('depot-editor-save').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/myentries');
	expect(page.url()).not.toContain('depotAction');
	await expect(
		page.locator('[data-sonner-toast]').filter({ hasText: 'Depot wurde aktualisiert.' })
	).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Owned Depot Updated')).toBeVisible({ timeout: 15000 });

	const updatedDepotRow = page
		.getByTestId('entry-item')
		.filter({ hasText: depotState.getOwnedDepotName() })
		.first();
	await updatedDepotRow.getByTestId('entry-action-delete-inline').click();
	await page.getByTestId('confirm-dialog-confirm').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/myentries');
	expect(page.url()).not.toContain('depotAction');
	await expect(
		page.locator('[data-sonner-toast]').filter({ hasText: 'Depot wurde gelöscht.' })
	).toBeVisible({ timeout: 15000 });
	await expect(page.getByText(depotState.getOwnedDepotName())).toBeHidden();
});

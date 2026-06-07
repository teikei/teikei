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
			features: ownedDepot ? [ownedFarm, ownedDepot] : [ownedFarm]
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

	await page.goto('/#/myentries');
	await page.getByTestId('create-depot-action').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/depots/new');
	await expect(page.getByTestId('depot-editor')).toBeVisible({ timeout: 15000 });

	await page.getByTestId('depot-input-name').fill('Created Depot');
	await page.getByTestId('depot-input-city').fill('Zurich');
	await page.getByTestId('depot-input-latitude').fill('47.39');
	await page.getByTestId('depot-input-longitude').fill('8.58');
	await page.getByLabel('Owned Farm').check();
	await page.getByTestId('depot-editor-save').click();

	await expect
		.poll(() => page.url(), { timeout: 15000 })
		.toContain('#/myentries?depotAction=created');
	await expect(page.getByTestId('depot-mutation-feedback')).toBeVisible({ timeout: 15000 });
	await expect(page.getByTestId('view-associated-farm-action')).toBeVisible();

	await page.getByTestId('view-associated-farm-action').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned');
	await expect(page.getByRole('heading', { name: 'Owned Farm' })).toBeVisible({ timeout: 15000 });
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

	await expect
		.poll(() => page.url(), { timeout: 15000 })
		.toContain('#/myentries?depotAction=updated');
	await expect(page.getByTestId('depot-mutation-feedback')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Owned Depot Updated')).toBeVisible({ timeout: 15000 });

	const updatedDepotRow = page
		.getByTestId('entry-item')
		.filter({ hasText: depotState.getOwnedDepotName() })
		.first();
	await updatedDepotRow.getByTestId('entry-action-delete-inline').click();
	await page.getByTestId('confirm-dialog-confirm').click();

	await expect
		.poll(() => page.url(), { timeout: 15000 })
		.toContain('#/myentries?depotAction=deleted');
	await expect(page.getByTestId('depot-mutation-feedback')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText(depotState.getOwnedDepotName())).toBeHidden();
});

import { expect, test, type Page, type Route } from '@playwright/test';

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

function buildFarmFeature(
	id: string,
	name: string,
	depots: ReturnType<typeof buildDepotFeature>[] = []
) {
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
			updatedAt: '2025-02-01T00:00:00.000Z',
			...(depots.length > 0
				? { depots: { type: 'FeatureCollection' as const, features: depots } }
				: {})
		}
	};
}

function buildInitiativeFeature(id: string, name: string) {
	return {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [8.56, 47.38] },
		properties: {
			id,
			type: 'Initiative' as const,
			name,
			postalcode: '8001',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			goals: [],
			updatedAt: '2025-02-01T00:00:00.000Z'
		}
	};
}

function buildDepotFeature(id: string, name: string) {
	return {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [8.58, 47.39] },
		properties: {
			id,
			type: 'Depot' as const,
			name,
			postalcode: '8002',
			city: 'Zurich',
			address: 'Bahnhofstrasse 1',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			deliveryDays: '',
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

interface DeleteApiOptions {
	/** Depot connected to the farm (own or foreign-owned — the client can't tell). */
	depot?: ReturnType<typeof buildDepotFeature>;
	withInitiative?: boolean;
}

async function mockDeleteApi(page: Page, options: DeleteApiOptions = {}) {
	const { depot, withInitiative = false } = options;
	const ownedFarm = buildFarmFeature('farm-owned', 'Owned Farm', depot ? [depot] : []);
	const ownedInitiative = buildInitiativeFeature('init-owned', 'Owned Initiative');

	let farmDeleted = false;
	let initiativeDeleted = false;
	let farmDeleteCalls = 0;
	let initiativeDeleteCalls = 0;
	let depotDeleteCalls = 0;
	let allEntriesFetches = 0;

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const url = new URL(route.request().url());
		const isMine = url.searchParams.get('mine') === 'true';
		if (isMine) {
			const features = [
				...(farmDeleted ? [] : [ownedFarm]),
				...(withInitiative && !initiativeDeleted ? [ownedInitiative] : [])
			];
			return fulfillJson(route, { type: 'FeatureCollection', features });
		}

		allEntriesFetches += 1;
		// The detached depot survives a farm deletion; only the farm disappears.
		const features = [
			...(farmDeleted ? [] : [ownedFarm]),
			...(withInitiative && !initiativeDeleted ? [ownedInitiative] : []),
			...(depot ? [depot] : [])
		];
		return fulfillJson(route, { type: 'FeatureCollection', features });
	});

	await page.route(/\/farms\/farm-owned(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() === 'DELETE') {
			farmDeleteCalls += 1;
			farmDeleted = true;
			await fulfillJson(route, ownedFarm);
			return;
		}
		await fulfillJson(route, ownedFarm);
	});

	await page.route(/\/initiatives\/init-owned(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() === 'DELETE') {
			initiativeDeleteCalls += 1;
			initiativeDeleted = true;
			await fulfillJson(route, ownedInitiative);
			return;
		}
		await fulfillJson(route, ownedInitiative);
	});

	// Track (and reject any hypothetical) depot deletions triggered by a farm delete.
	await page.route(/\/depots\/[^/]+(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() === 'DELETE') {
			depotDeleteCalls += 1;
		}
		await fulfillJson(route, depot ?? buildDepotFeature('depot-x', 'Pickup Point'));
	});

	return {
		getFarmDeleteCalls: () => farmDeleteCalls,
		getInitiativeDeleteCalls: () => initiativeDeleteCalls,
		getDepotDeleteCalls: () => depotDeleteCalls,
		getAllEntriesFetches: () => allEntriesFetches
	};
}

test('deleting a farm with depots states the detach consequence and removes it from my-entries and the map', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	const api = await mockDeleteApi(page, { depot: buildDepotFeature('depot-x', 'Pickup Point') });

	await page.goto('/#/myentries');

	const farmRow = page.getByTestId('entry-item').filter({ hasText: 'Owned Farm' }).first();
	await expect(farmRow).toBeVisible({ timeout: 15000 });
	await farmRow.getByTestId('entry-action-delete-inline').click();

	const dialog = page.getByTestId('confirm-dialog');
	await expect(dialog).toBeVisible({ timeout: 15000 });
	await expect(dialog).toContainText('Owned Farm');
	await expect(dialog).toContainText('Verbundene Abholorte werden vom Hof getrennt');

	const fetchesBefore = api.getAllEntriesFetches();
	await page.getByTestId('confirm-dialog-confirm').click();

	await expect(
		page.locator('[data-sonner-toast]').filter({ hasText: 'Hof wurde gelöscht.' })
	).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Owned Farm')).toBeHidden();

	expect(api.getFarmDeleteCalls()).toBe(1);
	// Detached, never deleted: the client issues no depot deletion.
	expect(api.getDepotDeleteCalls()).toBe(0);
	// The map re-fetches all entries (invalidateAll) so the marker disappears
	// without a full page reload.
	await expect
		.poll(() => api.getAllEntriesFetches(), { timeout: 15000 })
		.toBeGreaterThan(fetchesBefore);
});

test('deleting a farm never deletes a foreign-owned depot', async ({ page }) => {
	await mockAuthenticatedUser(page);
	const foreignDepot = buildDepotFeature('depot-foreign', 'Foreign Depot');
	const api = await mockDeleteApi(page, { depot: foreignDepot });

	await page.goto('/#/myentries');

	const farmRow = page.getByTestId('entry-item').filter({ hasText: 'Owned Farm' }).first();
	await expect(farmRow).toBeVisible({ timeout: 15000 });
	await farmRow.getByTestId('entry-action-delete-inline').click();
	await page.getByTestId('confirm-dialog-confirm').click();

	await expect(
		page.locator('[data-sonner-toast]').filter({ hasText: 'Hof wurde gelöscht.' })
	).toBeVisible({ timeout: 15000 });

	expect(api.getFarmDeleteCalls()).toBe(1);
	// The depot is detached by the API cascade, not deleted by the client.
	expect(api.getDepotDeleteCalls()).toBe(0);
});

test('cancelling the delete dialog performs no mutation', async ({ page }) => {
	await mockAuthenticatedUser(page);
	const api = await mockDeleteApi(page, { depot: buildDepotFeature('depot-x', 'Pickup Point') });

	await page.goto('/#/myentries');

	const farmRow = page.getByTestId('entry-item').filter({ hasText: 'Owned Farm' }).first();
	await expect(farmRow).toBeVisible({ timeout: 15000 });
	await farmRow.getByTestId('entry-action-delete-inline').click();

	const dialog = page.getByTestId('confirm-dialog');
	await expect(dialog).toBeVisible({ timeout: 15000 });
	await page.getByTestId('confirm-dialog-cancel').click();

	await expect(dialog).toBeHidden();
	// The farm is untouched: still listed, no delete request issued.
	await expect(page.getByText('Owned Farm')).toBeVisible();
	expect(api.getFarmDeleteCalls()).toBe(0);
	expect(api.getDepotDeleteCalls()).toBe(0);
});

test('deleting an initiative removes it from my-entries with success feedback', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	const api = await mockDeleteApi(page, { withInitiative: true });

	await page.goto('/#/myentries');

	const initiativeRow = page
		.getByTestId('entry-item')
		.filter({ hasText: 'Owned Initiative' })
		.first();
	await expect(initiativeRow).toBeVisible({ timeout: 15000 });
	await initiativeRow.getByTestId('entry-action-delete-inline').click();

	const dialog = page.getByTestId('confirm-dialog');
	await expect(dialog).toBeVisible({ timeout: 15000 });
	await expect(dialog).toContainText('Owned Initiative');
	// No depot consequence copy for initiatives.
	await expect(dialog).not.toContainText('Abholorte');
	await page.getByTestId('confirm-dialog-confirm').click();

	await expect(
		page.locator('[data-sonner-toast]').filter({ hasText: 'Initiative wurde gelöscht.' })
	).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Owned Initiative')).toBeHidden();

	expect(api.getInitiativeDeleteCalls()).toBe(1);
});

import { expect, test, type Page, type Route } from '@playwright/test';

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

function buildFarmFeature() {
	return {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [8.55, 47.37] },
		properties: {
			id: 'farm-owned',
			type: 'Farm' as const,
			name: 'Owned Farm',
			postalcode: '8000',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			products: [],
			badges: [],
			updatedAt: '2025-02-03T00:00:00.000Z'
		}
	};
}

function buildDepotFeature() {
	return {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [8.58, 47.39] },
		properties: {
			id: 'depot-owned',
			type: 'Depot' as const,
			name: 'Owned Depot',
			postalcode: '8001',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			deliveryDays: '',
			farms: {
				type: 'FeatureCollection' as const,
				features: [buildFarmFeature()]
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

async function mockEditorCatalogs(page: Page) {
	await page.route(/\/products(?:\/)?(?:\?.*)?$/, (route) => fulfillJson(route, []));
	await page.route(/\/goals(?:\/)?(?:\?.*)?$/, (route) => fulfillJson(route, []));
	await page.route(/\/badges(?:\/)?(?:\?.*)?$/, (route) => fulfillJson(route, []));
}

async function mockEntriesAndDetails(page: Page) {
	const ownedFarm = buildFarmFeature();
	const ownedDepot = buildDepotFeature();

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const url = new URL(route.request().url());
		if (url.searchParams.get('mine') === 'true') {
			return fulfillJson(route, {
				type: 'FeatureCollection',
				features: [ownedFarm, ownedDepot]
			});
		}

		return fulfillJson(route, {
			type: 'FeatureCollection',
			features: [ownedFarm, ownedDepot]
		});
	});

	await page.route(/\/farms\/farm-owned(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.55, 47.37] },
			properties: {
				id: 'farm-owned',
				type: 'Farm',
				name: 'Owned Farm',
				postalcode: '8000',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				description: '',
				address: '',
				street: '',
				housenumber: '',
				latitude: 47.37,
				longitude: 8.55,
				products: [],
				badges: [],
				acceptsNewMembers: 'yes',
				foundedAtYear: null,
				foundedAtMonth: null,
				maximumMembers: null,
				additionalProductInformation: '',
				participation: '',
				actsEcological: false,
				economicalBehavior: ''
			}
		})
	);

	await page.route(/\/depots\/depot-owned(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.58, 47.39] },
			properties: {
				id: 'depot-owned',
				type: 'Depot',
				name: 'Owned Depot',
				postalcode: '8001',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				deliveryDays: '',
				address: '',
				street: '',
				housenumber: '',
				description: '',
				farms: {
					type: 'FeatureCollection',
					features: [buildFarmFeature()]
				}
			}
		})
	);
}

test('farm edit cancel prompts on unsaved changes and returns to detail after confirm', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockEntriesAndDetails(page);

	await page.goto('/#/myentries');
	const farmRow = page.getByTestId('entry-item').filter({ hasText: 'Owned Farm' }).first();
	await farmRow.getByTestId('entry-action-edit-inline').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned/edit');
	await page.getByTestId('editor-input-name').fill('Owned Farm Updated');

	// Dismiss the discard dialog: stay on the edit route.
	await page.getByTestId('entry-editor-cancel').click();
	await page.getByTestId('confirm-dialog-cancel').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned/edit');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });

	// Confirm discard: return to the detail route.
	await page.getByTestId('entry-editor-cancel').click();
	await page.getByTestId('confirm-dialog-confirm').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned');
	await expect(page.getByRole('heading', { name: 'Owned Farm' })).toBeVisible({ timeout: 15000 });
});

test('farm create blocks browser back with unsaved changes until user confirms discard', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockEntriesAndDetails(page);

	await page.goto('/#/myentries');
	await page.getByTestId('create-farm-action').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/new');

	await page.getByTestId('editor-input-name').fill('Draft Farm');

	// Browser back is intercepted: dismissing the dialog keeps us on /new.
	await page.goBack();
	await page.getByTestId('confirm-dialog-cancel').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/new');

	// Confirming discard re-issues the navigation to the previous route.
	await page.goBack();
	await page.getByTestId('confirm-dialog-confirm').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/myentries');
	await expect(page.getByTestId('my-entries-create-actions')).toBeVisible({ timeout: 15000 });
});

test('depot edit cancel prompts on unsaved changes and preserves my-entries return', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockEntriesAndDetails(page);

	await page.goto('/#/myentries');
	const depotRow = page.getByTestId('entry-item').filter({ hasText: 'Owned Depot' }).first();
	await depotRow.getByTestId('entry-action-edit-inline').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/depots/depot-owned/edit');
	await page.getByTestId('depot-input-name').fill('Owned Depot Updated');

	// Dismiss the discard dialog: stay on the depot edit route.
	await page.getByTestId('depot-editor-cancel').click();
	await page.getByTestId('confirm-dialog-cancel').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/depots/depot-owned/edit');
	await expect(page.getByTestId('depot-editor')).toBeVisible({ timeout: 15000 });

	// Confirm discard: return to my-entries.
	await page.getByTestId('depot-editor-cancel').click();
	await page.getByTestId('confirm-dialog-confirm').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/myentries');
	await expect(page.getByTestId('my-entries-create-actions')).toBeVisible({ timeout: 15000 });
});

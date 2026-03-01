import { expect, test, type Page, type Route } from '@playwright/test';

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
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
	await page.route(/\/products(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, [
			{ id: 1, category: 'vegetable_products', name: 'vegetables', type: 'Product', link: '' },
			{ id: 2, category: 'beverages', name: 'juice', type: 'Product', link: '' }
		])
	);
	await page.route(/\/goals(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, [
			{ id: 10, name: 'land', type: 'Goal', link: '' },
			{ id: 11, name: 'consumers', type: 'Goal', link: '' }
		])
	);
	await page.route(/\/badges(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, [
			{
				id: 99,
				name: 'Badge A',
				category: 'associations',
				url: '',
				logo: '',
				type: 'Badge',
				link: ''
			}
		])
	);
}

async function mockOwnedEntriesAndDetails(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const url = new URL(route.request().url());
		if (url.searchParams.get('mine') === 'true') {
			return fulfillJson(route, {
				type: 'FeatureCollection',
				features: [
					{
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
							products: [
								{
									id: 1,
									category: 'vegetable_products',
									name: 'vegetables',
									type: 'Product',
									link: ''
								}
							],
							updatedAt: '2025-02-01T00:00:00.000Z'
						}
					},
					{
						type: 'Feature',
						geometry: { type: 'Point', coordinates: [8.56, 47.38] },
						properties: {
							id: 'initiative-owned',
							type: 'Initiative',
							name: 'Owned Initiative',
							postalcode: '8001',
							city: 'Zurich',
							state: 'ZH',
							country: 'CH',
							link: 'https://example.com',
							goals: [{ id: 10, name: 'land', type: 'Goal', link: '' }],
							updatedAt: '2025-01-01T00:00:00.000Z'
						}
					}
				]
			});
		}

		return fulfillJson(route, {
			type: 'FeatureCollection',
			features: []
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
				description: 'Owned farm description',
				address: 'Street 1',
				street: 'Street',
				housenumber: '1',
				latitude: 47.37,
				longitude: 8.55,
				products: [
					{ id: 1, category: 'vegetable_products', name: 'vegetables', type: 'Product', link: '' }
				],
				badges: [],
				acceptsNewMembers: 'yes',
				foundedAtYear: 2020,
				foundedAtMonth: 5,
				maximumMembers: 40,
				additionalProductInformation: '',
				participation: '',
				actsEcological: false,
				economicalBehavior: ''
			}
		})
	);
}

test('create farm from my-entries opens editor and replaces /new with detail URL on save', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	await page.route(/\/farms(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() !== 'POST') {
			return;
		}
		await fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.6, 47.4] },
			properties: {
				id: 'farm-created',
				type: 'Farm',
				name: 'Created Farm',
				postalcode: '8002',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				products: [],
				badges: []
			}
		});
	});
	await page.route(/\/farms\/farm-created(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.6, 47.4] },
			properties: {
				id: 'farm-created',
				type: 'Farm',
				name: 'Created Farm',
				postalcode: '8002',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				products: [],
				badges: []
			}
		})
	);

	await page.goto('/#/myentries');
	await page.getByTestId('create-farm-action').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/new');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });

	await page.getByTestId('editor-input-name').fill('Created Farm');
	await page.getByTestId('editor-input-city').fill('Zurich');
	await page.getByTestId('editor-input-latitude').fill('47.4');
	await page.getByTestId('editor-input-longitude').fill('8.6');
	await page.getByTestId('entry-editor-save').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-created');
	await expect(page.getByRole('heading', { name: 'Created Farm' })).toBeVisible({ timeout: 15000 });
});

test('edit farm from my-entries uses /edit route and replaces back to detail on save', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	let farmName = 'Owned Farm';
	await page.route(/\/farms\/farm-owned(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() === 'PATCH') {
			farmName = 'Owned Farm Updated';
		}

		await fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.55, 47.37] },
			properties: {
				id: 'farm-owned',
				type: 'Farm',
				name: farmName,
				postalcode: '8000',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				products: [],
				badges: []
			}
		});
	});

	await page.goto('/#/myentries');
	await page.getByTestId('entry-action-edit-inline').first().click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned/edit');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });

	await page.getByTestId('editor-input-name').fill('Owned Farm Updated');
	await page.getByTestId('editor-input-latitude').fill('47.37');
	await page.getByTestId('editor-input-longitude').fill('8.55');
	await page.getByTestId('entry-editor-save').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned');
	await expect(page.getByRole('heading', { name: 'Owned Farm Updated' })).toBeVisible({
		timeout: 15000
	});
});

test('owned farm detail shows edit action and pushes to /edit route', async ({ page }) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	await page.goto('/#/farms/farm-owned');
	await expect(page.getByRole('heading', { name: 'Owned Farm' })).toBeVisible({ timeout: 15000 });

	await page.getByTestId('entry-detail-edit').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned/edit');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });
});

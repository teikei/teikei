import { expect, test, type Page } from '@playwright/test';

const emptyEntriesResponse = {
	type: 'FeatureCollection',
	features: []
};

async function mockDepotToFarmResolution(page: Page) {
	await page.route('**/depots/2', (route) => {
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [8.54, 47.37] },
				properties: {
					id: '2',
					farms: {
						type: 'FeatureCollection',
						features: [
							{
								type: 'Feature',
								geometry: { type: 'Point', coordinates: [8.55, 47.38] },
								properties: { id: 'farm-9' }
							}
						]
					}
				}
			})
		});
	});

	await page.route('**/farms/farm-9', (route) => {
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [8.55, 47.38] },
				properties: {
					id: 'farm-9',
					type: 'Farm',
					name: 'Farm 9',
					city: 'Test City',
					link: 'https://example.com',
					description: 'Farm details',
					badges: [],
					createdAt: '2025-01-01T00:00:00.000Z',
					updatedAt: '2025-01-01T00:00:00.000Z',
					products: []
				}
			})
		});
	});
}

test.beforeEach(async ({ page }) => {
	await page.route('**/entries', (route) => {
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(emptyEntriesResponse)
		});
	});
});

test('legacy auth editAccount alias resolves to editaccount', async ({ page }) => {
	await page.goto('/#/users/editAccount');

	await expect
		.poll(() => page.url(), { timeout: 15000 })
		.toContain('#/users/sign-in?redirect=%23%2Fusers%2Feditaccount');
});

test('direct navigation to a protected route lands there when a session exists', async ({
	page
}) => {
	// Restore a session and answer the session-restore call with a deliberate
	// delay: the guard must await it rather than redirect on the null it sees
	// before the fetch resolves.
	await page.addInitScript(() => {
		window.localStorage.setItem('accessToken', 'test-token');
	});
	await page.route(/\/authentication(?:\/)?(?:\?.*)?$/, async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				accessToken: 'test-token',
				user: { id: 'user-1', email: 'owner@example.com', name: 'Owner User' }
			})
		});
	});

	await page.goto('/#/users/editaccount');

	// The visible form heading (the sr-only dialog title shares the same text).
	await expect(page.locator('h2', { hasText: 'Benutzerkonto anpassen' })).toBeVisible({
		timeout: 15000
	});
	expect(page.url()).toContain('#/users/editaccount');
	expect(page.url()).not.toContain('sign-in');
});

test('legacy depot detail URL redirects to associated farm detail URL', async ({ page }) => {
	await mockDepotToFarmResolution(page);

	await page.goto('/#/depots/2');

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-9');
});

test('legacy depot redirect keeps browser back behavior coherent', async ({ page }) => {
	await mockDepotToFarmResolution(page);

	await page.goto('/#/');
	await page.goto('/#/depots/2');
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-9');

	await page.goBack();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('/#/');
});

test('deep-linked farm detail opens popup for the selected entry', async ({ page }) => {
	await page.route('**/farms/24', (route) => {
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [8.55, 47.38] },
				properties: {
					id: '24',
					type: 'Farm',
					name: 'Farm 24',
					city: 'Test City',
					postalcode: '8000',
					state: 'ZH',
					country: 'CH',
					link: 'https://example.com',
					description: 'Farm details',
					badges: [],
					createdAt: '2025-01-01T00:00:00.000Z',
					updatedAt: '2025-01-01T00:00:00.000Z',
					products: []
				}
			})
		});
	});

	await page.goto('/#/farms/24');
	await expect(page.getByRole('heading', { name: 'Farm 24' })).toBeVisible({ timeout: 15000 });
	await expect(page.locator('.maplibregl-popup-content').getByText('Farm 24')).toBeVisible({
		timeout: 15000
	});
});

import { expect, test, type Page, type Route } from '@playwright/test';

function entriesCountLabel(count: number): RegExp {
	return new RegExp(`^${count} (Entries|Einträge|Entrées)$`);
}

function createEntriesResponse(features: Array<Record<string, unknown>>) {
	return {
		type: 'FeatureCollection',
		features
	};
}

function createFarmDetail(id: string, name: string) {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.54, 47.37] },
		properties: {
			id,
			type: 'Farm',
			name,
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
	};
}

function createInitiativeDetail(id: string, name: string) {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.57, 47.39] },
		properties: {
			id,
			type: 'Initiative',
			name,
			city: 'Test City',
			postalcode: '8000',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			description: 'Initiative details',
			badges: [],
			createdAt: '2025-01-01T00:00:00.000Z',
			updatedAt: '2025-01-01T00:00:00.000Z',
			goals: []
		}
	};
}

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

async function mockDepotAssociation(page: Page) {
	await page.route(/\/depots\/depot-1(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.54, 47.37] },
			properties: {
				id: 'depot-1',
				farms: {
					type: 'FeatureCollection',
					features: [
						{ type: 'Feature', properties: { id: 'farm-a' } },
						{ type: 'Feature', properties: { id: 'farm-b' } }
					]
				}
			}
		})
	);
}

async function mockDetailRoutes(page: Page) {
	await page.route(/\/farms\/[^/?]+(?:\?.*)?$/, (route) => {
		const farmId = route.request().url().split('/farms/')[1].split('?')[0];
		return fulfillJson(
			route,
			createFarmDetail(farmId, farmId === 'farm-a' ? 'Associated Farm A' : 'Farm')
		);
	});

	await page.route(/\/initiatives\/[^/?]+(?:\?.*)?$/, (route) => {
		const initiativeId = route.request().url().split('/initiatives/')[1].split('?')[0];
		return fulfillJson(route, createInitiativeDetail(initiativeId, 'Initiative Main'));
	});
}

test('depot entries are hidden from sidebar list', async ({ page }) => {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(
			route,
			createEntriesResponse([
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [8.54, 47.37] },
					properties: {
						id: 'depot-1',
						type: 'Depot',
						name: 'Depot One',
						postalcode: '8000',
						city: 'Zurich',
						state: 'ZH',
						country: 'CH',
						link: 'https://example.com'
					}
				}
			])
		)
	);

	await page.goto('/#/');
	await expect(page.getByText(entriesCountLabel(0))).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Depot One')).toBeHidden();
});

test('map marker click opens associated farm detail', async ({ page }) => {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(
			route,
			createEntriesResponse([
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [10.4515, 51.1657] },
					properties: {
						id: 'depot-1',
						type: 'Depot',
						name: 'Depot One',
						postalcode: '8000',
						city: 'Zurich',
						state: 'ZH',
						country: 'CH',
						link: 'https://example.com'
					}
				}
			])
		)
	);

	await mockDepotAssociation(page);
	await mockDetailRoutes(page);

	await page.goto('/#/');
	await expect(page.getByText(entriesCountLabel(0))).toBeVisible({ timeout: 15000 });
	await page.locator('.maplibregl-canvas').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-a');
});

test('farm and initiative list clicks use their own detail routes and open popup', async ({
	page
}) => {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(
			route,
			createEntriesResponse([
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [10.45, 51.16] },
					properties: {
						id: 'farm-main',
						type: 'Farm',
						name: 'Farm Main',
						postalcode: '8000',
						city: 'Zurich',
						state: 'ZH',
						country: 'CH',
						link: 'https://example.com',
						products: []
					}
				},
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [10.6, 51.2] },
					properties: {
						id: 'initiative-main',
						type: 'Initiative',
						name: 'Initiative Main',
						postalcode: '8000',
						city: 'Zurich',
						state: 'ZH',
						country: 'CH',
						link: 'https://example.com',
						goals: []
					}
				}
			])
		)
	);

	await mockDetailRoutes(page);

	await page.goto('/#/');
	await expect(page.getByText(entriesCountLabel(2))).toBeVisible({ timeout: 15000 });
	await page.getByText('Farm Main').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-main');
	await expect(page.locator('.maplibregl-popup-content')).toBeVisible({ timeout: 15000 });

	await page.goto('/#/');
	await page.getByText('Initiative Main').click();
	await expect
		.poll(() => page.url(), { timeout: 15000 })
		.toContain('#/initiatives/initiative-main');
	await expect(page.locator('.maplibregl-popup-content')).toBeVisible({ timeout: 15000 });
});

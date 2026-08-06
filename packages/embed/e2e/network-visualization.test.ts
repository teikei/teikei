import { expect, test, type Page, type Route } from '@playwright/test';

function entriesCountLabel(count: number): RegExp {
	return new RegExp(`^${count} (Entries|Einträge|Entrées)$`);
}

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

// The depot sits at the initial DE map centre so a canvas-centre click reliably
// hits it; the farm is placed close by so the network fitBounds lands at a zoom
// where individual (highlightable) symbol markers render.
const DEPOT_COORDS = [10.4515, 51.1657];
const FARM_COORDS = [10.44, 51.155];

function farmMarker(id: string, name: string) {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: FARM_COORDS },
		properties: {
			id,
			type: 'Farm',
			name,
			postalcode: '00000',
			city: 'Center',
			state: 'DE',
			country: 'DE',
			link: 'https://example.com',
			products: []
		}
	};
}

function depotMarker(id: string, name: string) {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: DEPOT_COORDS },
		properties: {
			id,
			type: 'Depot',
			name,
			postalcode: '00000',
			city: 'Center',
			state: 'DE',
			country: 'DE',
			link: 'https://example.com'
		}
	};
}

function farmDetailWithDepot(id: string, name: string) {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: FARM_COORDS },
		properties: {
			id,
			type: 'Farm',
			name,
			city: 'Center',
			postalcode: '00000',
			state: 'DE',
			country: 'DE',
			link: 'https://example.com',
			description: 'Farm details',
			badges: [],
			createdAt: '2025-01-01T00:00:00.000Z',
			updatedAt: '2025-01-01T00:00:00.000Z',
			products: [],
			depots: {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: { type: 'Point', coordinates: DEPOT_COORDS },
						properties: {
							id: 'depot-1',
							type: 'Depot',
							name: 'Depot One',
							city: 'Center',
							postalcode: '00000',
							state: 'DE',
							country: 'DE',
							link: 'https://example.com'
						}
					}
				]
			}
		}
	};
}

async function mockFarmDetail(page: Page) {
	await page.route(/\/farms\/[^/?]+(?:\?.*)?$/, (route) => {
		const farmId = route.request().url().split('/farms/')[1].split('?')[0];
		return fulfillJson(route, farmDetailWithDepot(farmId, 'Farm A'));
	});
}

async function mockDepotAssociation(page: Page) {
	await page.route(/\/depots\/depot-1(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: DEPOT_COORDS },
			properties: {
				id: 'depot-1',
				farms: {
					type: 'FeatureCollection',
					features: [{ type: 'Feature', properties: { id: 'farm-a' } }]
				}
			}
		})
	);
}

test('opening a farm profile with depots highlights the marker icon', async ({ page }) => {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [farmMarker('farm-a', 'Farm A')]
		})
	);
	await mockFarmDetail(page);

	await page.goto('/#/');
	await expect(page.getByText(entriesCountLabel(1))).toBeVisible({ timeout: 15000 });

	await page.getByText('Farm A').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-a');

	// Network active: the farm's marker is highlighted (shared with the network layer).
	await expect(page.locator('.marker-button--highlighted').first()).toBeVisible({ timeout: 15000 });
});

test('clicking a depot marker opens its farm and highlights the marker icon', async ({ page }) => {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [farmMarker('farm-a', 'Farm A'), depotMarker('depot-1', 'Depot One')]
		})
	);
	await mockDepotAssociation(page);
	await mockFarmDetail(page);

	await page.goto('/#/');
	await expect(page.getByText(entriesCountLabel(1))).toBeVisible({ timeout: 15000 });

	// Wait for the map to finish initializing (controls appear post-load) so the
	// canvas click reliably reaches an attached marker handler.
	await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible({ timeout: 15000 });

	// The depot marker sits at the initial map center; clicking the canvas hits it.
	await page.locator('.maplibregl-canvas').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-a');
	await expect(page.locator('.marker-button--highlighted').first()).toBeVisible({ timeout: 15000 });
});

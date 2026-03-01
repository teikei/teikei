import { expect, test, type Route } from '@playwright/test';

function entriesCountLabel(count: number): RegExp {
	return new RegExp(`^(Entries|Einträge|Entrées) \\(${count}\\)$`);
}

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

const entriesResponse = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.541694, 47.376887] },
			properties: {
				id: 'farm-zurich',
				type: 'Farm',
				name: 'Farm Zurich',
				postalcode: '8001',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				products: []
			}
		},
		{
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [11.576124, 48.137154] },
			properties: {
				id: 'farm-main',
				type: 'Farm',
				name: 'Farm Main',
				postalcode: '80331',
				city: 'Munich',
				state: 'Bayern',
				country: 'DE',
				link: 'https://example.com',
				products: []
			}
		}
	]
};

test.beforeEach(async ({ page }) => {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => fulfillJson(route, entriesResponse));
});

test('search autocomplete entry selection opens detail route', async ({ page }) => {
	await page.route(/\/autocomplete(?:\/)?(?:\?.*)?$/, async (route) => {
		const body = route.request().postDataJSON() as { text?: string };
		if (body?.text?.toLowerCase().includes('farm')) {
			await fulfillJson(route, [{ id: 'farm-main', title: 'Farm Main', type: 'farm' }]);
			return;
		}
		await fulfillJson(route, []);
	});

	await page.route(/\/farms\/farm-main(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [11.576124, 48.137154] },
			properties: {
				id: 'farm-main',
				type: 'Farm',
				name: 'Farm Main',
				postalcode: '80331',
				city: 'Munich',
				state: 'Bayern',
				country: 'DE',
				link: 'https://example.com',
				description: 'Farm details',
				badges: [],
				createdAt: '2025-01-01T00:00:00.000Z',
				updatedAt: '2025-01-01T00:00:00.000Z',
				products: []
			}
		})
	);

	await page.goto('/#/');
	await page.getByPlaceholder(/Search|Suchen|Rechercher/).fill('Farm');

	const suggestions = page.getByTestId('search-suggestions');
	await expect(suggestions.getByText('Farm Main')).toBeVisible({ timeout: 15000 });
	await suggestions.getByRole('button', { name: 'Farm Main' }).click({ noWaitAfter: true });

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-main');
	await expect(page.getByRole('heading', { name: 'Farm Main' })).toBeVisible({ timeout: 15000 });
});

test('search location selection and position deep-link recenter map list', async ({ page }) => {
	await page.route(/\/autocomplete(?:\/)?(?:\?.*)?$/, async (route) => {
		const body = route.request().postDataJSON() as { text?: string };
		if (body?.text?.toLowerCase().includes('zur')) {
			await fulfillJson(route, [{ id: 'loc-zh', title: 'Zurich, Switzerland', type: 'location' }]);
			return;
		}
		await fulfillJson(route, []);
	});

	await page.route(/\/geocoder(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			id: 'loc-zh',
			latitude: 47.376887,
			longitude: 8.541694
		})
	);

	await page.goto('/#/');
	await page.getByPlaceholder(/Search|Suchen|Rechercher/).fill('Zur');

	const suggestions = page.getByTestId('search-suggestions');
	await expect(suggestions.getByText('Zurich, Switzerland')).toBeVisible({ timeout: 15000 });
	await suggestions
		.getByRole('button', { name: 'Zurich, Switzerland' })
		.click({ noWaitAfter: true });

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/locations/loc-zh');
	await expect(page.getByText(entriesCountLabel(1))).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Farm Zurich')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Farm Main')).toBeHidden();

	await page.goto('/#/position/47.376887,8.541694');
	await expect(page.getByText(entriesCountLabel(1))).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Farm Zurich')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Farm Main')).toBeHidden();
});

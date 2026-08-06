import { expect, test, type Route } from '@playwright/test';

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
	await suggestions.getByRole('option', { name: 'Farm Main' }).click({ noWaitAfter: true });

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
		.getByRole('option', { name: 'Zurich, Switzerland' })
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

function farmDetailResponse(id: string, name: string, coordinates: [number, number]) {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates },
		properties: {
			id,
			type: 'Farm',
			name,
			postalcode: '80331',
			city: 'City',
			state: 'State',
			country: 'DE',
			link: 'https://example.com',
			description: `${name} details`,
			badges: [],
			depots: { type: 'FeatureCollection', features: [] },
			createdAt: '2025-01-01T00:00:00.000Z',
			updatedAt: '2025-01-01T00:00:00.000Z',
			products: []
		}
	};
}

test('grouped command search shows headings and a designed empty state', async ({ page }) => {
	await page.route(/\/autocomplete(?:\/)?(?:\?.*)?$/, async (route) => {
		const body = route.request().postDataJSON() as { text?: string };
		const text = body?.text?.toLowerCase() ?? '';
		if (text.includes('ber')) {
			await fulfillJson(route, [
				{ id: 'loc-berlin', title: 'Berlin, Germany', type: 'location' },
				{ id: 'farm-main', title: 'Farm Main', type: 'farm' }
			]);
			return;
		}
		await fulfillJson(route, []);
	});

	await page.goto('/#/');
	const search = page.getByPlaceholder(/Search|Suchen|Rechercher/);
	await search.fill('ber');

	const suggestions = page.getByTestId('search-suggestions');
	await expect(suggestions.getByRole('option', { name: 'Berlin, Germany' })).toBeVisible({
		timeout: 15000
	});
	await expect(suggestions.getByRole('option', { name: 'Farm Main' })).toBeVisible();
	// Grouped section headings (Locations / Farms) render above their results.
	await expect(suggestions.getByText('Orte')).toBeVisible();
	await expect(suggestions.getByText('Höfe')).toBeVisible();

	// A query with no matches shows the designed empty state, not a blank panel.
	await search.fill('zzz');
	await expect(page.getByTestId('search-empty')).toBeVisible({ timeout: 15000 });
});

test('slash shortcut focuses the drawer search', async ({ page }) => {
	await page.route(/\/autocomplete(?:\/)?(?:\?.*)?$/, (route) => fulfillJson(route, []));

	await page.goto('/#/');
	const search = page.getByPlaceholder(/Search|Suchen|Rechercher/);
	await expect(search).toBeVisible({ timeout: 15000 });

	// Move focus onto a non-input element inside the app root (collapsing the
	// drawer too), then the app-scoped shortcut should expand + focus the search.
	const toggle = page.getByTestId('sidebar-collapse-toggle');
	await toggle.click();
	await expect(search).not.toBeFocused();

	await page.keyboard.press('/');
	await expect(search).toBeFocused({ timeout: 15000 });
});

test('searching from an open farm profile replaces it', async ({ page }) => {
	await page.route(/\/autocomplete(?:\/)?(?:\?.*)?$/, async (route) => {
		const body = route.request().postDataJSON() as { text?: string };
		if (body?.text?.toLowerCase().includes('zur')) {
			await fulfillJson(route, [{ id: 'farm-zurich', title: 'Farm Zurich', type: 'farm' }]);
			return;
		}
		await fulfillJson(route, []);
	});
	await page.route(/\/farms\/farm-main(?:\?.*)?$/, (route) =>
		fulfillJson(route, farmDetailResponse('farm-main', 'Farm Main', [11.576124, 48.137154]))
	);
	await page.route(/\/farms\/farm-zurich(?:\?.*)?$/, (route) =>
		fulfillJson(route, farmDetailResponse('farm-zurich', 'Farm Zurich', [8.541694, 47.376887]))
	);

	await page.goto('/#/farms/farm-main');
	await expect(page.getByRole('heading', { name: 'Farm Main' })).toBeVisible({ timeout: 15000 });
	// The slim persistent header keeps a back button + search over the profile.
	await expect(page.getByTestId('detail-search-back')).toBeVisible();

	const search = page.getByPlaceholder(/Search|Suchen|Rechercher/);
	await search.fill('Zur');
	const suggestions = page.getByTestId('search-suggestions');
	await suggestions.getByRole('option', { name: 'Farm Zurich' }).click({ noWaitAfter: true });

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-zurich');
	await expect(page.getByRole('heading', { name: 'Farm Zurich' })).toBeVisible({ timeout: 15000 });
});

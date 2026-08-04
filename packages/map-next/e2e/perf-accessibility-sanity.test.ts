import { expect, test, type Page, type Route } from '@playwright/test';

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

async function mockLargeEntries(page: Page, count = 250) {
	const features = Array.from({ length: count }, (_, index) => ({
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [10.0 + index * 0.001, 51.0] },
		properties: {
			id: `farm-${index}`,
			type: 'Farm' as const,
			name: `Farm ${index}`,
			postalcode: '00000',
			city: 'Test City',
			state: 'DE',
			country: 'DE',
			link: 'https://example.com',
			products: []
		}
	}));

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, { type: 'FeatureCollection', features })
	);
}

async function mockAuthenticatedUser(page: Page) {
	await page.addInitScript(() => {
		window.localStorage.setItem('accessToken', 'test-token');
	});

	await page.route(/\/authentication(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			accessToken: 'test-token',
			user: { id: 'user-1', email: 'owner@example.com', name: 'Owner User' }
		})
	);
}

test('sidebar caps rendered rows for large all-entries lists and exposes cap indicator', async ({
	page
}) => {
	await mockLargeEntries(page);
	await page.goto('/#/');

	const listRows = page.getByTestId('entry-item');
	await expect(listRows).toHaveCount(200, { timeout: 15000 });
	await expect(page.getByTestId('entries-cap-indicator')).toHaveText(
		'250 Einträge · 200 angezeigt'
	);
});

test('sidebar interactive controls expose accessible labels', async ({ page }) => {
	await mockLargeEntries(page);
	await page.goto('/#/');

	await expect(page.getByTestId('sidebar-collapse-toggle')).toHaveAttribute('aria-label', /.+/);
	await expect(page.locator('input[aria-label]').first()).toHaveAttribute('aria-label', /.+/);
});

test('loading skeleton rows are hidden from the accessibility tree while aria-busy stays set', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		// The my-entries request is left hanging so the list stays in its loading
		// state for the duration of the test and the skeleton rows can be inspected.
		if (new URL(route.request().url()).searchParams.get('mine') === 'true') {
			return;
		}
		return fulfillJson(route, { type: 'FeatureCollection', features: [] });
	});

	await page.goto('/#/myentries');

	const list = page.getByTestId('entries-list');
	await expect(list).toHaveAttribute('aria-busy', 'true', { timeout: 15000 });
	await expect(page.getByTestId('entry-skeleton')).toHaveCount(5);

	await expect(list.getByRole('listitem')).toHaveCount(0);
});

test('entries list is named by the visible count indicator when capped', async ({ page }) => {
	await mockLargeEntries(page);
	await page.goto('/#/');

	await expect(page.getByTestId('entry-item')).toHaveCount(200, { timeout: 15000 });
	await expect(page.getByTestId('entries-list')).toHaveAccessibleName(
		'250 Einträge · 200 angezeigt'
	);
});

test('entries list is named by the visible count indicator when uncapped', async ({ page }) => {
	await mockLargeEntries(page, 3);
	await page.goto('/#/');

	await expect(page.getByTestId('entry-item')).toHaveCount(3, { timeout: 15000 });
	await expect(page.getByTestId('entries-list')).toHaveAccessibleName('3 Einträge');
});

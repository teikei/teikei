import { expect, test, type Page, type Route } from '@playwright/test';

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

async function mockLargeEntries(page: Page) {
	const features = Array.from({ length: 250 }, (_, index) => ({
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

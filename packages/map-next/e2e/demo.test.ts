import { expect, test } from '@playwright/test';

test('home page renders map', async ({ page }) => {
	await page.route('**/entries', (route) => {
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				type: 'FeatureCollection',
				features: []
			})
		});
	});

	await page.goto('/');
	await expect(page.locator('.maplibregl-map')).toBeVisible({ timeout: 15000 });
});

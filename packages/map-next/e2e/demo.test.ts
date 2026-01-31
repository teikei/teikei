import { expect, test } from '@playwright/test';

test('home page renders map', async ({ page }) => {
	await page.goto('/');
	// Check that the map container is rendered (wait for MapLibre to initialize)
	await expect(page.locator('.maplibregl-map')).toBeVisible({ timeout: 15000 });
});

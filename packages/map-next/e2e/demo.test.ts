import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	// TODO this test only works because the error page also has an h1
	await expect(page.locator('h1')).toBeVisible();
});

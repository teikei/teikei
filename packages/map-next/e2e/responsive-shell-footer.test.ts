import { expect, test, type Page, type Route } from '@playwright/test';

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

async function mockEntries(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, { type: 'FeatureCollection', features: [] })
	);
}

test('footer legal and attribution links are visible', async ({ page }) => {
	await mockEntries(page);
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/#/');

	const attribution = page.locator('.maplibregl-ctrl-attrib');
	await expect(attribution).toBeVisible({ timeout: 15000 });
	await expect(attribution.locator('a[href="https://ernte-teilen.org/"]')).toBeVisible();
	await expect(
		attribution.locator('a[href="https://ernte-teilen.org/datenschutz/"]')
	).toBeVisible();
	await expect(attribution.locator('a[href="https://ernte-teilen.org/impressum/"]')).toBeVisible();
	await expect(attribution.locator('a[href="https://maplibre.org/"]')).toBeVisible();
	await expect(attribution.locator('a[href="https://www.mapbox.com/map-feedback/"]')).toHaveCount(
		0
	);
	await expect(attribution).not.toContainText(/Improve this map|Améliorer cette carte/i);

	const attributionText = await attribution.innerText();
	const openStreetMapOccurrences = (attributionText.match(/OpenStreetMap/g) ?? []).length;
	expect(openStreetMapOccurrences).toBe(1);

	const indexSite = attributionText.indexOf('ernte-teilen.org');
	const indexImprint = attributionText.indexOf('Impressum');
	const indexPrivacy = attributionText.indexOf('Datenschutz');
	const indexMapData = attributionText.indexOf('Kartendaten:');
	expect(indexSite).toBeGreaterThan(-1);
	expect(indexImprint).toBeGreaterThan(indexSite);
	expect(indexPrivacy).toBeGreaterThan(indexImprint);
	expect(indexMapData).toBeGreaterThan(indexPrivacy);
});

test('sidebar shell uses desktop width at lg breakpoints', async ({ page }) => {
	await mockEntries(page);
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/#/');

	const shell = page.getByTestId('map-sidebar-shell');
	await expect(shell).toBeVisible({ timeout: 15000 });
	const box = await shell.boundingBox();

	expect(box).not.toBeNull();
	expect(box!.width).toBeGreaterThan(480);
	expect(box!.width).toBeLessThan(520);
});

test('sidebar shell expands to near full width on mobile', async ({ page }) => {
	await mockEntries(page);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/#/');

	const shell = page.getByTestId('map-sidebar-shell');
	await expect(shell).toBeVisible({ timeout: 15000 });
	const box = await shell.boundingBox();

	expect(box).not.toBeNull();
	expect(box!.x).toBeGreaterThanOrEqual(8);
	expect(box!.width).toBeGreaterThan(360);
});

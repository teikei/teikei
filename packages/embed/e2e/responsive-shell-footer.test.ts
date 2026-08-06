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

async function mockEntriesWithSingleFarm(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [10.4515, 51.1657] },
					properties: {
						id: 'farm-mobile',
						type: 'Farm',
						name: 'Farm Mobile',
						postalcode: '00000',
						city: 'Kaufungen',
						state: 'DE',
						country: 'DE',
						link: 'https://example.com',
						products: []
					}
				}
			]
		})
	);

	await page.route(/\/farms\/farm-mobile(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [10.4515, 51.1657] },
			properties: {
				id: 'farm-mobile',
				type: 'Farm',
				name: 'Farm Mobile',
				postalcode: '00000',
				city: 'Kaufungen',
				state: 'DE',
				country: 'DE',
				link: 'https://example.com',
				description: 'Mobile detail',
				products: [],
				badges: []
			}
		})
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
	// The mobile shell is now an edge-to-edge bottom sheet (Feature 5).
	expect(box!.x).toBeGreaterThanOrEqual(0);
	expect(box!.width).toBeGreaterThan(360);
});

test('desktop collapse toggle shrinks sidebar height instead of leaving empty full-height shell', async ({
	page
}) => {
	await mockEntries(page);
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/#/');

	const shell = page.getByTestId('map-sidebar-shell');
	await expect(shell).toBeVisible({ timeout: 15000 });
	const expandedBox = await shell.boundingBox();
	expect(expandedBox).not.toBeNull();

	await page.getByTestId('sidebar-collapse-toggle').click();
	await expect
		.poll(async () => (await shell.boundingBox())?.height ?? 0)
		.toBeLessThan((expandedBox?.height ?? 0) / 2);
});

test('opening detail from collapsed mobile sheet expands into bounded, closable detail panel', async ({
	browser
}) => {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
	const page = await context.newPage();

	try {
		await mockEntriesWithSingleFarm(page);
		await page.goto('/#/');

		await page.getByTestId('sidebar-collapse-toggle').click();
		// Collapsing snaps the bottom sheet to its peek height (Feature 5).
		await expect
			.poll(async () => (await page.getByTestId('map-sidebar-shell').boundingBox())?.height ?? 0)
			.toBeLessThan(200);

		await page.locator('.maplibregl-canvas').click();
		await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-mobile');

		const shell = page.getByTestId('map-sidebar-shell');
		const closeButton = shell.getByTestId('entry-detail-close');
		await expect(closeButton).toBeVisible({ timeout: 15000 });

		const box = await shell.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.y).toBeGreaterThanOrEqual(0);
		expect(box!.height).toBeLessThanOrEqual(844);

		await closeButton.click();
		await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/');
	} finally {
		await context.close();
	}
});

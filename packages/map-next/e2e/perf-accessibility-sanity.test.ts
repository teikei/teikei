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

	// Context-scoped so tabs opened by a modified click inherit the mocks too.
	await page
		.context()
		.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
			fulfillJson(route, { type: 'FeatureCollection', features })
		);
	await page.context().route(/\/farms\/farm-\d+$/, (route) => {
		const id = new URL(route.request().url()).pathname.split('/').pop();
		return fulfillJson(
			route,
			features.find((feature) => feature.properties.id === id)
		);
	});
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

test('entry rows are links pointing at the entry detail route', async ({ page }) => {
	await mockLargeEntries(page);
	await page.goto('/#/');

	const firstRow = page.getByTestId('entry-row').first();
	await expect(firstRow).toBeVisible({ timeout: 15000 });
	await expect(firstRow).toHaveJSProperty('tagName', 'A');
	await expect(firstRow).toHaveAttribute('href', '#/farms/farm-0');
});

test('modified clicks on an entry row open a new tab and leave the list untouched', async ({
	page
}) => {
	await mockLargeEntries(page);
	await page.goto('/#/');

	const firstRow = page.getByTestId('entry-row').first();
	await expect(firstRow).toBeVisible({ timeout: 15000 });

	for (const openInNewTab of [
		() => firstRow.click({ modifiers: ['ControlOrMeta'] }),
		() => firstRow.click({ button: 'middle' })
	]) {
		const popupPromise = page.context().waitForEvent('page');
		await openInNewTab();
		const popup = await popupPromise;
		await expect.poll(() => popup.url(), { timeout: 15000 }).toContain('#/farms/farm-0');
		await popup.close();

		expect(page.url()).not.toContain('farms/farm-0');
		await expect(page.getByTestId('entry-item')).toHaveCount(200);
	}
});

// Rows sit under `data-sveltekit-preload-data="hover"` on <body>, and hovering the
// list is the normal way to find a marker — so preloading must stay off the hover path.
test('hovering entry rows preloads no detail data', async ({ page }) => {
	await mockLargeEntries(page);

	const detailRequests: string[] = [];
	page.on('request', (request) => {
		if (/\/farms\/farm-\d+$/.test(new URL(request.url()).pathname)) {
			detailRequests.push(request.url());
		}
	});

	await page.goto('/#/');
	await expect(page.getByTestId('entry-row').first()).toBeVisible({ timeout: 15000 });

	for (let index = 0; index < 5; index++) {
		await page.getByTestId('entry-row').nth(index).hover();
	}
	await page.waitForTimeout(1500);
	expect(detailRequests).toEqual([]);
});

test('sidebar interactive controls expose accessible labels', async ({ page }) => {
	await mockLargeEntries(page);
	await page.goto('/#/');

	await expect(page.getByTestId('sidebar-collapse-toggle')).toHaveAttribute('aria-label', /.+/);
	await expect(page.locator('input[aria-label]').first()).toHaveAttribute('aria-label', /.+/);
});

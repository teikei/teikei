import { expect, test, type Page, type Route } from '@playwright/test';

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

async function mockMapBootstrap(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, { type: 'FeatureCollection', features: [] })
	);
}

async function mockMapWithSingleFarm(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [10.4515, 51.1657] },
					properties: {
						id: 'farm-overlay',
						type: 'Farm',
						name: 'Farm Overlay',
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

	await page.route(/\/farms\/farm-overlay(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [10.4515, 51.1657] },
			properties: {
				id: 'farm-overlay',
				type: 'Farm',
				name: 'Farm Overlay',
				postalcode: '00000',
				city: 'Kaufungen',
				state: 'DE',
				country: 'DE',
				link: 'https://example.com',
				products: [],
				badges: []
			}
		})
	);
}

test('sign-in overlay is full-screen and usable on mobile', async ({ browser }) => {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
	const page = await context.newPage();

	try {
		await mockMapBootstrap(page);
		await page.goto('/#/users/sign-in');

		const dialog = page.locator('[data-slot="dialog-content"]');
		await expect(dialog).toBeVisible({ timeout: 15000 });
		await expect(dialog.locator('button[type="submit"]')).toBeVisible();

		const box = await dialog.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.width).toBeGreaterThanOrEqual(388);
		expect(box!.height).toBeGreaterThanOrEqual(840);
		expect(box!.x).toBeLessThanOrEqual(1);
		expect(box!.y).toBeLessThanOrEqual(1);
	} finally {
		await context.close();
	}
});

test('sign-in overlay remains centered and non-clipped on desktop', async ({ page }) => {
	await mockMapBootstrap(page);
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/#/users/sign-in');

	const dialog = page.locator('[data-slot="dialog-content"]');
	await expect(dialog).toBeVisible({ timeout: 15000 });
	await expect(dialog.locator('button[type="submit"]')).toBeVisible();

	const box = await dialog.boundingBox();
	expect(box).not.toBeNull();
	expect(box!.width).toBeLessThan(1200);
	expect(box!.height).toBeLessThan(890);
	expect(box!.x).toBeGreaterThan(0);
	expect(box!.y).toBeGreaterThan(0);
});

test('map controls stay reachable on mobile while sidebar is open', async ({ browser }) => {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
	const page = await context.newPage();

	try {
		await mockMapBootstrap(page);
		await page.goto('/#/');

		await expect(page.getByTestId('map-sidebar-shell')).toBeVisible({ timeout: 15000 });

		const zoomInButton = page.locator(
			'.maplibregl-ctrl-top-right .maplibregl-ctrl-group .maplibregl-ctrl-zoom-in'
		);
		await expect(zoomInButton).toBeVisible({ timeout: 15000 });
		await zoomInButton.click();
	} finally {
		await context.close();
	}
});

test.fixme('fix this when creating overlay design system component with proper stacking - auth overlay stacks above existing map popup', async ({
	page
}) => {
	await mockMapWithSingleFarm(page);
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/#/');

	await page.locator('.maplibregl-canvas').click();
	const popup = page.locator('.maplibregl-popup');
	await expect(popup).toBeVisible({ timeout: 15000 });
	const popupZIndex = await popup.evaluate((node) =>
		Number(window.getComputedStyle(node).zIndex || '0')
	);

	await page.goto('/#/users/sign-in');
	const overlay = page.locator('[data-slot="dialog-overlay"]');
	await expect(overlay).toBeVisible({ timeout: 15000 });

	const overlayZIndex = await overlay.evaluate((node) =>
		Number(window.getComputedStyle(node).zIndex || '0')
	);

	expect(overlayZIndex).toBeGreaterThan(popupZIndex);
});

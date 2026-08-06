import { expect, test, type Page, type Route } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 390, height: 844 };

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

async function mockEmptyEntries(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, { type: 'FeatureCollection', features: [] })
	);
}

async function mockSingleFarm(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [10.4515, 51.1657] },
					properties: {
						id: 'farm-sheet',
						type: 'Farm',
						name: 'Farm Sheet',
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

	await page.route(/\/farms\/farm-sheet(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [10.4515, 51.1657] },
			properties: {
				id: 'farm-sheet',
				type: 'Farm',
				name: 'Farm Sheet',
				postalcode: '00000',
				city: 'Kaufungen',
				state: 'DE',
				country: 'DE',
				link: 'https://example.com',
				description: 'Sheet detail',
				products: [],
				badges: []
			}
		})
	);
}

// Drag the sheet handle to an absolute viewport y position. Pointer capture on
// the handle keeps the drag tracked even when the pointer leaves the handle.
async function dragHandleTo(page: Page, targetY: number) {
	const handle = page.getByTestId('bottom-sheet-handle');
	const box = await handle.boundingBox();
	expect(box).not.toBeNull();
	const startX = box!.x + box!.width / 2;
	const startY = box!.y + box!.height / 2;
	await page.mouse.move(startX, startY);
	await page.mouse.down();
	await page.mouse.move(startX, (startY + targetY) / 2, { steps: 6 });
	await page.mouse.move(startX, targetY, { steps: 6 });
	await page.mouse.up();
}

async function shellHeight(page: Page): Promise<number> {
	return (await page.getByTestId('map-sidebar-shell').boundingBox())?.height ?? 0;
}

// Tapping a WebGL marker races the initial map render, so click until the
// detail route opens. The guard avoids re-clicking once navigation succeeded.
async function tapMarkerUntilDetail(page: Page, urlPart: string) {
	await expect(async () => {
		if (!page.url().includes(urlPart)) {
			await page.locator('.maplibregl-canvas').click();
		}
		await page.waitForTimeout(400);
		expect(page.url()).toContain(urlPart);
	}).toPass({ timeout: 20000 });
}

test('list bottom sheet drags between peek, half and full snap points', async ({ browser }) => {
	const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
	const page = await context.newPage();

	try {
		await mockEmptyEntries(page);
		await page.goto('/#/');

		const shell = page.getByTestId('map-sidebar-shell');
		await expect(shell).toBeVisible({ timeout: 15000 });
		await expect(page.getByTestId('bottom-sheet-handle')).toBeVisible();

		// Opens at half height by default.
		await expect.poll(() => shellHeight(page)).toBeGreaterThan(300);
		await expect.poll(() => shellHeight(page)).toBeLessThan(620);

		// Drag the handle up to full height.
		await dragHandleTo(page, 30);
		await expect.poll(() => shellHeight(page)).toBeGreaterThan(700);

		// Drag the handle down to the peek snap; the map stays uncovered above it.
		await dragHandleTo(page, 820);
		await expect.poll(() => shellHeight(page)).toBeLessThan(210);
		await expect(page.locator('.maplibregl-canvas')).toBeVisible();
	} finally {
		await context.close();
	}
});

test('detail sheet opens at half, expands to full, and peeks back to the map keeping the selection', async ({
	browser
}) => {
	const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
	const page = await context.newPage();

	try {
		await mockSingleFarm(page);
		await page.goto('/#/');

		// Collapse to peek so the centered farm marker is not under the sheet.
		await page.getByTestId('sidebar-collapse-toggle').click();
		await expect.poll(() => shellHeight(page)).toBeLessThan(210);

		// Tap the marker to open the detail view.
		await tapMarkerUntilDetail(page, '#/farms/farm-sheet');

		// Detail opens at half height.
		await expect(page.getByTestId('entry-detail-close')).toBeVisible({ timeout: 15000 });
		await expect.poll(() => shellHeight(page)).toBeGreaterThan(300);
		await expect.poll(() => shellHeight(page)).toBeLessThan(620);

		// Drag up to reveal the full profile.
		await dragHandleTo(page, 30);
		await expect.poll(() => shellHeight(page)).toBeGreaterThan(700);

		// Drag down to peek: back to the map, selection preserved.
		await dragHandleTo(page, 820);
		await expect.poll(() => shellHeight(page)).toBeLessThan(210);
		expect(page.url()).toContain('#/farms/farm-sheet');
		await expect(page.getByTestId('entry-detail-close')).toBeVisible();
	} finally {
		await context.close();
	}
});

test('contact sheet opens at full height and cannot be peeked away', async ({ browser }) => {
	const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
	const page = await context.newPage();

	try {
		await mockSingleFarm(page);
		// Contact is a task level: unlike the detail sheet (half) it opens at full
		// and stays expanded, matching the editors.
		await page.goto('/#/farms/farm-sheet/contact');

		await expect(page.getByTestId('entry-contact-form')).toBeVisible({ timeout: 15000 });
		await expect.poll(() => shellHeight(page)).toBeGreaterThan(700);

		// Dragging down to peek snaps straight back to the expanded height.
		await dragHandleTo(page, 820);
		await expect.poll(() => shellHeight(page)).toBeGreaterThan(700);
	} finally {
		await context.close();
	}
});

test('mobile focus lifts the selected entry into the upper half, above the sheet', async ({
	browser
}) => {
	const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
	const page = await context.newPage();

	try {
		await mockSingleFarm(page);
		// Deep-link straight to the detail route: this deterministically opens the
		// detail sheet and pans/focuses the entry (no flaky WebGL marker click).
		await page.goto('/#/farms/farm-sheet');

		await expect(page.getByTestId('entry-detail-close')).toBeVisible({ timeout: 15000 });

		// The entry popup should sit in the upper half of the viewport, clear of the
		// half-height sheet at the bottom (rather than being pushed off-screen by the
		// desktop right-of-sidebar offset).
		const popup = page.locator('.maplibregl-popup');
		await expect(popup).toBeVisible({ timeout: 15000 });
		await expect
			.poll(async () => {
				const box = await popup.boundingBox();
				return box ? box.y + box.height / 2 : Number.POSITIVE_INFINITY;
			})
			.toBeLessThan(MOBILE_VIEWPORT.height / 2);
	} finally {
		await context.close();
	}
});

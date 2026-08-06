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

// The count must be a single element whose text changes, never two swapped by an
// `{#if}` — a live region that is replaced rather than rewritten never announces.
test('the entry count is a live region that survives the capped/uncapped switch', async ({
	page
}) => {
	await mockLargeEntries(page);
	await page.goto('/#/');

	const capped = page.getByTestId('entries-cap-indicator');
	await expect(capped).toHaveText('250 Einträge · 200 angezeigt', { timeout: 15000 });
	await expect(capped).toHaveAttribute('aria-live', 'polite');
	await capped.evaluate((el) => ((el as HTMLElement & { marked?: boolean }).marked = true));

	// Zoom in until fewer than the 200-row cap remain, flipping the label variant.
	const zoomIn = page.getByRole('button', { name: 'Zoom in' });
	for (let step = 0; step < 8; step++) {
		await zoomIn.click();
	}
	await expect(capped).toHaveCount(0, { timeout: 15000 });

	const count = page.locator('[data-slot="sidebar-group-label"] [aria-live="polite"]');
	await expect(count).toHaveText(/^\d+ Einträge$/);
	const sameNode = await count.evaluate(
		(el) => (el as HTMLElement & { marked?: boolean }).marked === true
	);
	expect(sameNode).toBe(true);
	await expect(page.getByTestId('entries-list')).toHaveAccessibleName(
		((await count.textContent()) ?? '').trim()
	);
});

// The my-entries count does not change with map movement, so announcing it would
// be noise; it is deliberately a plain element.
test('the my-entries count is not a live region', async ({ page }) => {
	await mockAuthenticatedUser(page);
	await mockLargeEntries(page, 3);
	await page.goto('/#/myentries');

	await expect(page.getByTestId('entry-item')).toHaveCount(3, { timeout: 15000 });
	await expect(page.getByTestId('map-sidebar-shell').locator('[aria-live]')).toHaveCount(0);
});

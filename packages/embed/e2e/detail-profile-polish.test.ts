import { expect, test, type Page, type Route } from '@playwright/test';

// Farms sit in a tiny cluster around the initial DE map centre so they all stay
// inside the (huge, low-zoom) viewport regardless of which one is focused — the
// sidebar list then stays stable in length across a detail open/close, which is
// what the scroll-restore assertion relies on.
const CENTER: [number, number] = [10.44, 51.15];

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

function farmMarker(id: string, name: string, coords: [number, number]) {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: coords },
		properties: {
			id,
			type: 'Farm',
			name,
			postalcode: '00000',
			city: 'Center',
			state: 'DE',
			country: 'DE',
			link: 'https://example.com',
			acceptsNewMembers: 'yes',
			products: []
		}
	};
}

// A rich farm detail: two product categories (→ chip clusters) and a membership
// status (→ Membership section), so the polished read view can be asserted.
function richFarmDetail(id: string, name: string) {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: CENTER },
		properties: {
			id,
			type: 'Farm',
			name,
			city: 'Center',
			postalcode: '00000',
			state: 'DE',
			country: 'DE',
			link: 'https://example.com',
			description: 'A farm that describes itself.',
			acceptsNewMembers: 'yes',
			foundedAtYear: 2020,
			foundedAtMonth: 5,
			badges: [],
			products: [
				{ id: '1', category: 'vegetables', name: 'potato', type: 'Product', link: '' },
				{ id: '2', category: 'vegetables', name: 'carrot', type: 'Product', link: '' },
				{ id: '3', category: 'fruits', name: 'apple', type: 'Product', link: '' }
			]
		}
	};
}

async function mockFarmDetail(page: Page, detail: (id: string, name: string) => unknown) {
	await page.route(/\/farms\/[^/?]+(?:\?.*)?$/, (route) => {
		const farmId = route.request().url().split('/farms/')[1].split('?')[0];
		return fulfillJson(route, detail(farmId, 'Farm A'));
	});
}

test('farm profile renders product chips, a membership chip, and a sticky contact CTA', async ({
	page
}) => {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [farmMarker('farm-a', 'Farm A', CENTER)]
		})
	);
	await mockFarmDetail(page, richFarmDetail);

	await page.goto('/#/');
	await page.getByText('Farm A').click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-a');
	await expect(page.getByRole('heading', { name: 'Farm A' })).toBeVisible({ timeout: 15000 });

	// Membership status shows once, inside the Membership section (the list card
	// is unmounted while the profile is open, so this is the only one on screen).
	await expect(page.getByTestId('membership-status')).toHaveCount(1);

	// Products render as chip clusters grouped by category, not bullet lists.
	await expect(page.getByTestId('product-category-group')).toHaveCount(2);
	await expect(page.getByTestId('product-chip')).toHaveCount(3);
	await expect(page.locator('[data-testid="profile-section-products"] ul')).toHaveCount(0);

	// The contact CTA is a primary button in the sticky drawer footer.
	const footerCta = page.locator(
		'[data-slot="sidebar-footer"] [data-testid="entry-contact-toggle"]'
	);
	await expect(footerCta).toBeVisible();
	await footerCta.click();
	await expect(page.getByTestId('entry-contact-form')).toBeVisible();
});

test('back from a detail view restores the previous list scroll position', async ({ page }) => {
	const farms = Array.from({ length: 30 }, (_, i) => {
		const id = `farm-${String(i).padStart(2, '0')}`;
		const coords: [number, number] = [CENTER[0] + i * 0.0004, CENTER[1] + i * 0.0004];
		return farmMarker(id, `Farm ${String(i).padStart(2, '0')}`, coords);
	});

	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, { type: 'FeatureCollection', features: farms })
	);
	await mockFarmDetail(page, (id, name) => ({
		type: 'Feature',
		geometry: { type: 'Point', coordinates: CENTER },
		properties: {
			id,
			type: 'Farm',
			name,
			city: 'Center',
			postalcode: '00000',
			state: 'DE',
			country: 'DE',
			link: 'https://example.com',
			badges: [],
			products: []
		}
	}));

	await page.goto('/#/');
	await expect(page.getByTestId('entry-row').first()).toBeVisible({ timeout: 15000 });

	const list = page.locator('[data-slot="sidebar-content"]');
	// Scroll the list to the bottom and remember the offset.
	const scrolledTo = await list.evaluate((el) => {
		el.scrollTop = el.scrollHeight;
		return el.scrollTop;
	});
	expect(scrolledTo).toBeGreaterThan(50);

	// Open a detail (last, currently-visible row so Playwright doesn't re-scroll).
	await page.getByTestId('entry-row').last().click();
	await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/#\/farms\/farm-\d+/);
	await expect(page.getByTestId('detail-search-back')).toBeVisible({ timeout: 15000 });

	// Back restores the list and its scroll position (not a reset to the top).
	await page.getByTestId('detail-search-back').click();
	await expect(page.getByTestId('entry-row').first()).toBeVisible({ timeout: 15000 });
	await expect
		.poll(async () => list.evaluate((el) => el.scrollTop), { timeout: 15000 })
		.toBeGreaterThan(scrolledTo - 30);
});

import { expect, test, type Page, type Route } from '@playwright/test';

// Feature 4 (edit-mode parity): toggling Bearbeiten must keep the same section
// headings in the same order; edit mode shows exactly one Cancel and one Save
// control and the entry name stays the header heading in both modes.

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

async function mockAuthenticatedUser(page: Page) {
	await page.addInitScript(() => {
		window.localStorage.setItem('accessToken', 'test-token');
	});

	await page.route(/\/authentication(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			accessToken: 'test-token',
			user: {
				id: 'user-1',
				email: 'owner@example.com',
				name: 'Owner User'
			}
		})
	);
}

async function mockEditorCatalogs(page: Page) {
	await page.route(/\/products(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, [
			{ id: 1, category: 'vegetable_products', name: 'vegetables', type: 'Product', link: '' }
		])
	);
	await page.route(/\/goals(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, [{ id: 10, name: 'land', type: 'Goal', link: '' }])
	);
	await page.route(/\/badges(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, [
			{
				id: 99,
				name: 'Badge A',
				category: 'associations',
				url: '',
				logo: '',
				type: 'Badge',
				link: ''
			},
			{
				id: 100,
				name: 'Cert B',
				category: 'certifications',
				url: '',
				logo: '',
				type: 'Badge',
				link: ''
			}
		])
	);
}

// Fully-populated features so every read-mode section renders — heading-sequence
// parity is only observable when no section is skipped for lack of data.
const farmProperties = {
	id: 'farm-owned',
	type: 'Farm',
	name: 'Owned Farm',
	postalcode: '8000',
	city: 'Zurich',
	state: 'ZH',
	country: 'CH',
	link: 'https://example.com',
	url: 'https://example.com',
	description: 'Owned farm description',
	address: 'Street 1',
	street: 'Street',
	housenumber: '1',
	latitude: 47.37,
	longitude: 8.55,
	products: [
		{ id: 1, category: 'vegetable_products', name: 'vegetables', type: 'Product', link: '' }
	],
	badges: [
		{ id: 99, name: 'Badge A', category: 'associations', url: '', logo: '', type: 'Badge' },
		{ id: 100, name: 'Cert B', category: 'certifications', url: '', logo: '', type: 'Badge' }
	],
	acceptsNewMembers: 'yes',
	foundedAtYear: 2020,
	foundedAtMonth: 5,
	maximumMembers: 40,
	additionalProductInformation: 'Fresh vegetables weekly',
	participation: 'Weekly harvest help',
	actsEcological: true,
	economicalBehavior: 'Regenerative practices'
};

const initiativeProperties = {
	id: 'initiative-owned',
	type: 'Initiative',
	name: 'Owned Initiative',
	postalcode: '8001',
	city: 'Zurich',
	state: 'ZH',
	country: 'CH',
	link: 'https://example.com',
	url: 'https://example.com',
	description: 'Owned initiative description',
	address: 'Street 2',
	latitude: 47.38,
	longitude: 8.56,
	goals: [{ id: 10, name: 'land', type: 'Goal', link: '' }],
	badges: [{ id: 99, name: 'Badge A', category: 'associations', url: '', logo: '', type: 'Badge' }]
};

async function mockOwnedEntriesAndDetails(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [8.55, 47.37] },
					properties: farmProperties
				},
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [8.56, 47.38] },
					properties: initiativeProperties
				}
			]
		})
	);

	await page.route(/\/farms\/farm-owned(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.55, 47.37] },
			properties: farmProperties
		})
	);

	await page.route(/\/initiatives\/initiative-owned(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.56, 47.38] },
			properties: initiativeProperties
		})
	);
}

// Section headings are the `ProfileSection` title elements (h5), one per titled
// section; the identity section intentionally has no heading in either mode.
const SECTION_HEADINGS = '[data-testid^="profile-section-"] > h5';

test('farm edit mode renders the same section headings as read mode, one cancel/save', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	await page.goto('/#/farms/farm-owned');
	await expect(page.getByRole('heading', { name: 'Owned Farm' })).toBeVisible({ timeout: 15000 });

	// Read mode drops the Description heading (prose only): products, economic,
	// membership, badges = 4. The retrying count assertion settles rendering
	// before the text snapshot.
	await expect(page.locator(SECTION_HEADINGS)).toHaveCount(4, { timeout: 15000 });
	const readHeadings = await page.locator(SECTION_HEADINGS).allTextContents();

	await page.getByTestId('entry-detail-edit').click();
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });

	// The entry name stays the header heading; the name field lives in identity.
	await expect(page.getByRole('heading', { name: 'Owned Farm' })).toBeVisible();
	await expect(
		page.locator('[data-testid="profile-section-identity"] [data-testid="editor-input-name"]')
	).toBeVisible();

	// Edit mode adds two leading edit-only headings — Description (labels the
	// field) and Account info (ProfileSection since the shadcn card restyle);
	// every other section keeps an identical heading, so read == edit minus
	// those first two entries.
	await expect(page.locator(SECTION_HEADINGS)).toHaveCount(readHeadings.length + 2, {
		timeout: 15000
	});
	const editHeadings = await page.locator(SECTION_HEADINGS).allTextContents();
	expect(editHeadings.slice(2)).toEqual(readHeadings);

	// Exactly one Cancel and one Save control (the sticky save bar).
	await expect(page.getByTestId('entry-editor-cancel')).toHaveCount(1);
	await expect(page.getByTestId('entry-editor-save')).toHaveCount(1);
});

test('initiative edit mode renders the same section headings as read mode, one cancel/save', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	await page.goto('/#/initiatives/initiative-owned');
	await expect(page.getByRole('heading', { name: 'Owned Initiative' })).toBeVisible({
		timeout: 15000
	});

	// Read mode drops the Description heading (prose only): goals, badges = 2.
	await expect(page.locator(SECTION_HEADINGS)).toHaveCount(2, { timeout: 15000 });
	const readHeadings = await page.locator(SECTION_HEADINGS).allTextContents();

	await page.getByTestId('entry-detail-edit').click();
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });

	await expect(page.getByRole('heading', { name: 'Owned Initiative' })).toBeVisible();
	await expect(
		page.locator('[data-testid="profile-section-identity"] [data-testid="editor-input-name"]')
	).toBeVisible();

	// Edit mode adds two leading edit-only headings (Description, Account info);
	// the rest match.
	await expect(page.locator(SECTION_HEADINGS)).toHaveCount(readHeadings.length + 2, {
		timeout: 15000
	});
	const editHeadings = await page.locator(SECTION_HEADINGS).allTextContents();
	expect(editHeadings.slice(2)).toEqual(readHeadings);

	await expect(page.getByTestId('entry-editor-cancel')).toHaveCount(1);
	await expect(page.getByTestId('entry-editor-save')).toHaveCount(1);
});

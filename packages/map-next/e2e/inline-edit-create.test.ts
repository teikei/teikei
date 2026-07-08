import { expect, test, type Page, type Route } from '@playwright/test';

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
			{ id: 1, category: 'vegetable_products', name: 'vegetables', type: 'Product', link: '' },
			{ id: 2, category: 'beverages', name: 'juice', type: 'Product', link: '' }
		])
	);
	await page.route(/\/goals(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, [
			{ id: 10, name: 'land', type: 'Goal', link: '' },
			{ id: 11, name: 'consumers', type: 'Goal', link: '' }
		])
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
			}
		])
	);
}

async function mockOwnedEntriesAndDetails(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const url = new URL(route.request().url());
		if (url.searchParams.get('mine') === 'true') {
			return fulfillJson(route, {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: { type: 'Point', coordinates: [8.55, 47.37] },
						properties: {
							id: 'farm-owned',
							type: 'Farm',
							name: 'Owned Farm',
							postalcode: '8000',
							city: 'Zurich',
							state: 'ZH',
							country: 'CH',
							link: 'https://example.com',
							products: [
								{
									id: 1,
									category: 'vegetable_products',
									name: 'vegetables',
									type: 'Product',
									link: ''
								}
							],
							updatedAt: '2025-02-01T00:00:00.000Z'
						}
					},
					{
						type: 'Feature',
						geometry: { type: 'Point', coordinates: [8.56, 47.38] },
						properties: {
							id: 'initiative-owned',
							type: 'Initiative',
							name: 'Owned Initiative',
							postalcode: '8001',
							city: 'Zurich',
							state: 'ZH',
							country: 'CH',
							link: 'https://example.com',
							goals: [{ id: 10, name: 'land', type: 'Goal', link: '' }],
							updatedAt: '2025-01-01T00:00:00.000Z'
						}
					}
				]
			});
		}

		return fulfillJson(route, {
			type: 'FeatureCollection',
			features: []
		});
	});

	await page.route(/\/farms\/farm-owned(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.55, 47.37] },
			properties: {
				id: 'farm-owned',
				type: 'Farm',
				name: 'Owned Farm',
				postalcode: '8000',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				description: 'Owned farm description',
				address: 'Street 1',
				street: 'Street',
				housenumber: '1',
				latitude: 47.37,
				longitude: 8.55,
				products: [
					{ id: 1, category: 'vegetable_products', name: 'vegetables', type: 'Product', link: '' }
				],
				badges: [],
				acceptsNewMembers: 'yes',
				foundedAtYear: 2020,
				foundedAtMonth: 5,
				maximumMembers: 40,
				additionalProductInformation: '',
				participation: '',
				actsEcological: false,
				economicalBehavior: ''
			}
		})
	);

	await page.route(/\/initiatives\/initiative-owned(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.56, 47.38] },
			properties: {
				id: 'initiative-owned',
				type: 'Initiative',
				name: 'Owned Initiative',
				postalcode: '8001',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				description: 'Owned initiative description',
				address: 'Street 2',
				latitude: 47.38,
				longitude: 8.56,
				goals: [{ id: 10, name: 'land', type: 'Goal', link: '' }],
				badges: []
			}
		})
	);
}

test('create farm from my-entries opens editor and replaces /new with detail URL on save', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	await page.route(/\/autocomplete(?:\/)?(?:\?.*)?$/, async (route) => {
		const body = route.request().postDataJSON() as { text?: string };
		if (body?.text?.toLowerCase().includes('zur')) {
			await fulfillJson(route, [
				{ id: 'loc-zurich', title: 'Zurich, Switzerland', type: 'location' }
			]);
			return;
		}
		await fulfillJson(route, []);
	});
	await page.route(/\/geocoder(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, { id: 'loc-zurich', city: 'Zurich', latitude: 47.4, longitude: 8.6 })
	);

	await page.route(/\/farms(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() !== 'POST') {
			return;
		}
		await fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.6, 47.4] },
			properties: {
				id: 'farm-created',
				type: 'Farm',
				name: 'Created Farm',
				postalcode: '8002',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				products: [],
				badges: []
			}
		});
	});
	await page.route(/\/farms\/farm-created(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.6, 47.4] },
			properties: {
				id: 'farm-created',
				type: 'Farm',
				name: 'Created Farm',
				postalcode: '8002',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				products: [],
				badges: []
			}
		})
	);

	await page.goto('/#/myentries');
	await page.getByTestId('create-farm-action').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/new');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });

	// Creation is the same single section form as editing (Feature 9): fill the
	// required identity & location fields, then save — no wizard steps.
	await page.getByTestId('editor-input-name').fill('Created Farm');
	await page.getByTestId('editor-input-geocoder').fill('Zurich');
	await page.getByText('Zurich, Switzerland').click();
	await expect(page.getByTestId('editor-input-geocoder')).toHaveValue('Zurich', { timeout: 15000 });

	await page.getByTestId('entry-editor-save').click();

	// Saving lands on the new farm's read profile (not edit mode), replacing /new.
	await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/#\/farms\/farm-created$/);
	await expect(page.getByRole('heading', { name: 'Created Farm' })).toBeVisible({
		timeout: 15000
	});
});

test('edit farm from my-entries uses /edit route and replaces back to detail on save', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	let farmName = 'Owned Farm';
	await page.route(/\/farms\/farm-owned(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() === 'PATCH') {
			farmName = 'Owned Farm Updated';
		}

		await fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.55, 47.37] },
			properties: {
				id: 'farm-owned',
				type: 'Farm',
				name: farmName,
				postalcode: '8000',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				address: 'Street 1',
				products: [],
				badges: []
			}
		});
	});

	await page.goto('/#/myentries');
	await page.getByTestId('entry-action-edit-inline').first().click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned/edit');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });

	await page.getByTestId('editor-input-name').fill('Owned Farm Updated');
	// The geocoder field is untouched here: an unmodified location submits the
	// existing address/coordinates hydrated from the loaded farm feature.
	await page.getByTestId('entry-editor-save').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned');
	await expect(page.getByRole('heading', { name: 'Owned Farm Updated' })).toBeVisible({
		timeout: 15000
	});
});

test('farm edit save with a required field cleared surfaces the save-bar section indicator', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	await page.goto('/#/farms/farm-owned/edit');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });

	// Clearing the required name blocks save and names the offending section.
	await page.getByTestId('editor-input-name').fill('');
	await page.getByTestId('entry-editor-save').click();

	await expect(page.getByTestId('editor-error-summary')).toBeVisible({ timeout: 15000 });
	// Save is blocked: still on the edit route.
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned/edit');
});

test('owned farm detail shows edit action and pushes to /edit route', async ({ page }) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	await page.goto('/#/farms/farm-owned');
	await expect(page.getByRole('heading', { name: 'Owned Farm' })).toBeVisible({ timeout: 15000 });

	await page.getByTestId('entry-detail-edit').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/farm-owned/edit');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });
});

test('initiative /edit deep link opens inline edit mode and saves back to detail', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	let initiativeName = 'Owned Initiative';
	await page.route(/\/initiatives\/initiative-owned(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() === 'PATCH') {
			initiativeName = 'Owned Initiative Updated';
		}

		await fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.56, 47.38] },
			properties: {
				id: 'initiative-owned',
				type: 'Initiative',
				name: initiativeName,
				postalcode: '8001',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				address: 'Street 2',
				goals: [{ id: 10, name: 'land', type: 'Goal', link: '' }],
				badges: []
			}
		});
	});

	await page.goto('/#/initiatives/initiative-owned/edit');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });
	await expect(page.getByTestId('editor-input-name')).toHaveValue('Owned Initiative', {
		timeout: 15000
	});

	await page.getByTestId('editor-input-name').fill('Owned Initiative Updated');
	// The geocoder field is untouched: the stored location submits unchanged.
	await page.getByTestId('entry-editor-save').click();

	await expect
		.poll(() => page.url(), { timeout: 15000 })
		.toContain('#/initiatives/initiative-owned');
	await expect(page.getByRole('heading', { name: 'Owned Initiative Updated' })).toBeVisible({
		timeout: 15000
	});
});

test('create initiative from my-entries opens the section form and lands on detail on save', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);

	await page.route(/\/autocomplete(?:\/)?(?:\?.*)?$/, async (route) => {
		const body = route.request().postDataJSON() as { text?: string };
		if (body?.text?.toLowerCase().includes('zur')) {
			await fulfillJson(route, [
				{ id: 'loc-zurich', title: 'Zurich, Switzerland', type: 'location' }
			]);
			return;
		}
		await fulfillJson(route, []);
	});
	await page.route(/\/geocoder(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, { id: 'loc-zurich', city: 'Zurich', latitude: 47.4, longitude: 8.6 })
	);

	await page.route(/\/initiatives(?:\/)?(?:\?.*)?$/, async (route) => {
		if (route.request().method() !== 'POST') {
			return;
		}
		await fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.6, 47.4] },
			properties: {
				id: 'initiative-created',
				type: 'Initiative',
				name: 'Created Initiative',
				postalcode: '8002',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				goals: [],
				badges: []
			}
		});
	});
	await page.route(/\/initiatives\/initiative-created(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [8.6, 47.4] },
			properties: {
				id: 'initiative-created',
				type: 'Initiative',
				name: 'Created Initiative',
				postalcode: '8002',
				city: 'Zurich',
				state: 'ZH',
				country: 'CH',
				link: 'https://example.com',
				goals: [],
				badges: []
			}
		})
	);

	await page.goto('/#/myentries');
	await page.getByTestId('create-initiative-action').click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/initiatives/new');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });

	await page.getByTestId('editor-input-name').fill('Created Initiative');
	await page.getByTestId('editor-input-geocoder').fill('Zurich');
	await page.getByText('Zurich, Switzerland').click();
	await expect(page.getByTestId('editor-input-geocoder')).toHaveValue('Zurich', { timeout: 15000 });

	await page.getByTestId('entry-editor-save').click();

	// Saving lands on the new initiative's read profile (not edit mode), replacing /new.
	await expect
		.poll(() => page.url(), { timeout: 15000 })
		.toMatch(/#\/initiatives\/initiative-created$/);
	await expect(page.getByRole('heading', { name: 'Created Initiative' })).toBeVisible({
		timeout: 15000
	});
});

test('detail drawer is near-full-height and the editor drawer is wider on lg desktop', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEditorCatalogs(page);
	await mockOwnedEntriesAndDetails(page);
	await page.setViewportSize({ width: 1280, height: 900 });

	const shell = page.getByTestId('map-sidebar-shell');

	// Detail mode: shares the editor's near-full-height insets (top-2.5 bottom-2.5),
	// so a profile fills most of a tall viewport instead of the old min(70vh,36rem) box.
	await page.goto('/#/farms/farm-owned');
	await expect(page.getByRole('heading', { name: 'Owned Farm' })).toBeVisible({ timeout: 15000 });
	const detailBox = await shell.boundingBox();
	expect(detailBox).not.toBeNull();
	// 900px viewport minus the 10px (top-2.5) + 10px (bottom-2.5) insets.
	expect(detailBox!.height).toBeGreaterThan(800);
	// Detail keeps the standard sidebar width.
	expect(detailBox!.width).toBeGreaterThan(480);
	expect(detailBox!.width).toBeLessThan(520);

	// Editor mode: measurably wider (~680px) on lg while list/detail stay ~500px.
	await page.goto('/#/farms/farm-owned/edit');
	await expect(page.getByTestId('entry-editor')).toBeVisible({ timeout: 15000 });
	await expect.poll(async () => (await shell.boundingBox())?.width ?? 0).toBeGreaterThan(640);
	const editorBox = await shell.boundingBox();
	expect(editorBox!.width).toBeLessThan(720);
	// Map stays visible beside the wider editor (drawer doesn't span the viewport).
	expect(editorBox!.x + editorBox!.width).toBeLessThan(1280);
});

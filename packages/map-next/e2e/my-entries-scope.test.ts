import { expect, test, type Page, type Route } from '@playwright/test';

function entriesCountLabel(count: number): RegExp {
	return new RegExp(`^${count} (Entries|Einträge|Entrées)$`);
}

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

async function mockEntriesEndpoints(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const url = new URL(route.request().url());
		const isMine = url.searchParams.get('mine') === 'true';
		if (isMine) {
			return fulfillJson(route, {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: { type: 'Point', coordinates: [8.55, 47.37] },
						properties: {
							id: 'owned-old',
							type: 'Farm',
							name: 'Owned Old',
							postalcode: '8000',
							city: 'Zurich',
							state: 'ZH',
							country: 'CH',
							link: 'https://example.com',
							products: [],
							updatedAt: '2025-01-01T00:00:00.000Z'
						}
					},
					{
						type: 'Feature',
						geometry: { type: 'Point', coordinates: [8.56, 47.38] },
						properties: {
							id: 'owned-new',
							type: 'Initiative',
							name: 'Owned New',
							postalcode: '8001',
							city: 'Zurich',
							state: 'ZH',
							country: 'CH',
							link: 'https://example.com',
							goals: [],
							updatedAt: '2025-02-01T00:00:00.000Z'
						}
					}
				]
			});
		}

		return fulfillJson(route, {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [10.45, 51.16] },
					properties: {
						id: 'public-farm',
						type: 'Farm',
						name: 'Public Farm',
						postalcode: '00000',
						city: 'Public',
						state: 'DE',
						country: 'DE',
						link: 'https://example.com',
						products: []
					}
				}
			]
		});
	});
}

test('direct #/myentries route opens drawer in my-entries scope with owned list sorted by updatedAt', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEntriesEndpoints(page);

	await page.goto('/#/myentries');

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/myentries');
	await expect(page.getByTestId('scope-switch')).toBeVisible({ timeout: 15000 });
	await expect(page.getByTestId('scope-my-entries')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText(entriesCountLabel(2))).toBeVisible({ timeout: 15000 });

	await expect(page.getByText('Owned Old')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Owned New')).toBeVisible({ timeout: 15000 });
	await expect(page.getByText('Public Farm')).toBeHidden();

	const firstRow = page.getByTestId('entry-row').first();
	await expect(firstRow).toContainText('Owned New');
});

test('user menu "Manage entries" opens canonical #/myentries scope', async ({ page }) => {
	await mockAuthenticatedUser(page);
	await mockEntriesEndpoints(page);

	await page.goto('/#/');
	await page.getByRole('button', { name: /Owner User/ }).click();
	await page.getByRole('menuitem', { name: /Meine Einträge|Mes entrées|My entries/ }).click();

	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/myentries');
	await expect(page.getByTestId('scope-my-entries')).toBeVisible({ timeout: 15000 });
});

test('my-entries scope shows sticky create row and desktop inline row actions', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEntriesEndpoints(page);

	await page.goto('/#/myentries');

	const createActions = page.getByTestId('my-entries-create-actions');
	await expect(createActions).toBeVisible({ timeout: 15000 });
	await expect(page.getByTestId('create-farm-action')).toBeVisible();
	await expect(page.getByTestId('create-depot-action')).toBeVisible();
	await expect(page.getByTestId('create-initiative-action')).toBeVisible();

	const firstRow = page.getByTestId('entry-item').first();
	await expect(firstRow.getByTestId('entry-row-actions-desktop')).toBeVisible();
	await expect(firstRow.getByTestId('entry-action-edit-inline')).toBeVisible();
	await expect(firstRow.getByTestId('entry-action-delete-inline')).toBeVisible();
	await expect(firstRow.getByTestId('entry-row-actions-mobile')).toBeHidden();
});

test('my-entries scope switches row actions to overflow on mobile', async ({ browser }) => {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
	const page = await context.newPage();

	try {
		await mockAuthenticatedUser(page);
		await mockEntriesEndpoints(page);

		await page.goto('/#/myentries');

		const firstRow = page.getByTestId('entry-item').first();
		await expect(firstRow.getByTestId('entry-row-actions-desktop')).toBeHidden({ timeout: 15000 });
		await expect(firstRow.getByTestId('entry-row-actions-mobile')).toBeVisible({ timeout: 15000 });

		const overflowTrigger = firstRow.getByTestId('entry-actions-overflow-trigger');
		await expect(overflowTrigger).toBeVisible();
		await overflowTrigger.click();

		await expect(page.getByTestId('entry-action-edit-overflow')).toBeVisible();
		await expect(page.getByTestId('entry-action-delete-overflow')).toBeVisible();
	} finally {
		await context.close();
	}
});

test('my-entries scope keeps overflow row actions on tablet widths to avoid clipping', async ({
	browser
}) => {
	const context = await browser.newContext({ viewport: { width: 900, height: 900 } });
	const page = await context.newPage();

	try {
		await mockAuthenticatedUser(page);
		await mockEntriesEndpoints(page);

		await page.goto('/#/myentries');

		const firstRow = page.getByTestId('entry-item').first();
		await expect(firstRow.getByTestId('entry-row-actions-desktop')).toBeHidden({ timeout: 15000 });
		await expect(firstRow.getByTestId('entry-row-actions-mobile')).toBeVisible({ timeout: 15000 });

		const overflowTrigger = firstRow.getByTestId('entry-actions-overflow-trigger');
		await expect(overflowTrigger).toBeVisible();
		await overflowTrigger.click();

		await expect(page.getByTestId('entry-action-edit-overflow')).toBeVisible();
		await expect(page.getByTestId('entry-action-delete-overflow')).toBeVisible();
	} finally {
		await context.close();
	}
});

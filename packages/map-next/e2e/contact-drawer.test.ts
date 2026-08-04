import { expect, test, type Page, type Route } from '@playwright/test';

// Feature 5: "Kontakt aufnehmen" opens a dedicated contact drawer view rather
// than appending the form to the profile. This covers session prefill, the
// owner-hidden CTA, and back-navigation to the profile.

async function fulfillJson(route: Route, body: unknown) {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

function farmDetail(id: string, name: string) {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.55, 47.38] },
		properties: {
			id,
			type: 'Farm',
			name,
			city: 'Test City',
			postalcode: '8000',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			description: 'Farm details',
			badges: [],
			products: []
		}
	};
}

function ownedFarmMarker(id: string, name: string) {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.55, 47.38] },
		properties: {
			id,
			type: 'Farm',
			name,
			postalcode: '8000',
			city: 'Test City',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			products: [],
			updatedAt: '2025-02-01T00:00:00.000Z'
		}
	};
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

// `ownedIds` are returned as the user's own entries (`mine=true`); everything
// else is public. A farm detail is served for any /farms/:id request.
async function mockEntries(page: Page, ownedIds: string[]) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) => {
		const url = new URL(route.request().url());
		if (url.searchParams.get('mine') === 'true') {
			return fulfillJson(route, {
				type: 'FeatureCollection',
				features: ownedIds.map((id) => ownedFarmMarker(id, `Owned ${id}`))
			});
		}
		return fulfillJson(route, {
			type: 'FeatureCollection',
			features: [ownedFarmMarker('public-farm', 'Public Farm')]
		});
	});
	await page.route(/\/farms\/[^/?]+(?:\?.*)?$/, (route) => {
		const id = route.request().url().split('/farms/')[1].split('?')[0].split('#')[0];
		return fulfillJson(route, farmDetail(id, id === 'public-farm' ? 'Public Farm' : `Owned ${id}`));
	});
}

test('contact view prefills name/email from the session and back returns to the profile', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEntries(page, []); // user owns nothing → CTA shows on the public farm

	await page.goto('/#/farms/public-farm');
	await expect(page.getByRole('heading', { name: 'Public Farm' })).toBeVisible({ timeout: 15000 });

	await page.getByTestId('entry-contact-toggle').click();

	// Feature 1: the contact view is a route of its own, not local profile state.
	await expect.poll(() => page.url(), { timeout: 15000 }).toContain('#/farms/public-farm/contact');

	// Entry name stays visible in the contact view header, fields are prefilled.
	await expect(page.getByRole('heading', { name: 'Public Farm' })).toBeVisible();
	await expect(page.locator('#entry-contact-sender-name')).toHaveValue('Owner User');
	await expect(page.locator('#entry-contact-sender-email')).toHaveValue('owner@example.com');

	// Prefilled fields remain editable.
	await page.locator('#entry-contact-sender-name').fill('Someone Else');
	await expect(page.locator('#entry-contact-sender-name')).toHaveValue('Someone Else');

	// Back returns to the profile route (contact form unmounted, sections back).
	await page.getByTestId('entry-contact-back').click();
	await expect(page.getByTestId('entry-contact-form')).toBeHidden();
	await expect(page.getByTestId('entry-contact-toggle')).toBeVisible();
	await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/#\/farms\/public-farm$/);
});

test('a contact deep link opens the form and browser back returns to the profile', async ({
	page
}) => {
	await mockAuthenticatedUser(page);
	await mockEntries(page, []);

	// Fresh load straight into the contact route: the form renders for the entry,
	// and waits for the session so the prefill matches the click path.
	await page.goto('/#/farms/public-farm/contact');
	await expect(page.getByTestId('entry-contact-form')).toBeVisible({ timeout: 15000 });
	await expect(page.getByRole('heading', { name: 'Public Farm' })).toBeVisible();
	await expect(page.locator('#entry-contact-sender-name')).toHaveValue('Owner User');
	await expect(page.locator('#entry-contact-sender-email')).toHaveValue('owner@example.com');

	// Opening contact from a profile pushes a history entry, so browser back
	// returns to the profile rather than dropping all the way to the list.
	await page.goto('/#/farms/public-farm');
	await expect(page.getByTestId('entry-contact-toggle')).toBeVisible({ timeout: 15000 });
	await page.getByTestId('entry-contact-toggle').click();
	await expect(page.getByTestId('entry-contact-form')).toBeVisible();

	await page.goBack();
	await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/#\/farms\/public-farm$/);
	await expect(page.getByTestId('entry-contact-form')).toBeHidden();
	await expect(page.getByTestId('entry-contact-toggle')).toBeVisible();
});

test('a contact deep link for an owned entry redirects to its profile', async ({ page }) => {
	await mockAuthenticatedUser(page);
	await mockEntries(page, ['my-farm']); // user owns this farm

	await page.goto('/#/farms/my-farm/contact');

	// Owners edit rather than contact themselves: the contact route bounces to the profile.
	await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/#\/farms\/my-farm$/);
	await expect(page.getByTestId('entry-contact-form')).toHaveCount(0);
	await expect(page.getByTestId('entry-detail-edit')).toBeVisible();
});

test('contact CTA is hidden on an entry the current account owns', async ({ page }) => {
	await mockAuthenticatedUser(page);
	await mockEntries(page, ['my-farm']); // user owns this farm

	await page.goto('/#/farms/my-farm');
	await expect(page.getByRole('heading', { name: 'Owned my-farm' })).toBeVisible({
		timeout: 15000
	});

	// Owners edit rather than contact themselves: the CTA is absent, Edit present.
	await expect(page.getByTestId('entry-detail-edit')).toBeVisible();
	await expect(page.getByTestId('entry-contact-toggle')).toHaveCount(0);
});

test('contact view is left once ownership resolves for an owner', async ({ page }) => {
	await mockAuthenticatedUser(page);

	// Ownership resolves async: the owned-entries (mine=true) response is delayed so
	// `canEdit` starts false and the CTA is briefly available on the owner's own farm.
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, async (route) => {
		const url = new URL(route.request().url());
		if (url.searchParams.get('mine') === 'true') {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			return fulfillJson(route, {
				type: 'FeatureCollection',
				features: [ownedFarmMarker('race-farm', 'Owned race-farm')]
			});
		}
		return fulfillJson(route, { type: 'FeatureCollection', features: [] });
	});
	await page.route(/\/farms\/[^/?]+(?:\?.*)?$/, (route) =>
		fulfillJson(route, farmDetail('race-farm', 'Owned race-farm'))
	);

	await page.goto('/#/farms/race-farm');
	await expect(page.getByRole('heading', { name: 'Owned race-farm' })).toBeVisible({
		timeout: 15000
	});

	// Before ownership resolves the CTA is available; open the contact view.
	await page.getByTestId('entry-contact-toggle').click();
	await expect(page.getByTestId('entry-contact-form')).toBeVisible();

	// Once myEntries resolves the contact route redirects to the profile (owners
	// cannot message themselves); the Edit action appears.
	await expect(page.getByTestId('entry-contact-form')).toBeHidden({ timeout: 15000 });
	await expect.poll(() => page.url(), { timeout: 15000 }).toMatch(/#\/farms\/race-farm$/);
	await expect(page.getByTestId('entry-contact-toggle')).toHaveCount(0);
	await expect(page.getByTestId('entry-detail-edit')).toBeVisible();
});

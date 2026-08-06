import { expect, test, type Page, type Route } from '@playwright/test';

function createFarmDetail(id: string, name: string) {
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

async function fulfillJson(route: Route, body: unknown, status = 200) {
	await route.fulfill({
		status,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});
}

async function mockBaseEntries(page: Page) {
	await page.route(/\/entries(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, {
			type: 'FeatureCollection',
			features: []
		})
	);
}

test('signup verification token in hash query shows banner and clears params', async ({ page }) => {
	await mockBaseEntries(page);

	let confirmationRequestPayload: unknown = null;
	await page.route(/\/authManagement(?:\/)?(?:\?.*)?$/, async (route) => {
		confirmationRequestPayload = route.request().postDataJSON();
		await fulfillJson(route, { isVerified: true });
	});

	await page.goto('/#/?confirmation_token=verify-123');

	await expect(page.getByTestId('token-feedback-banner')).toBeVisible({ timeout: 15000 });
	await expect(page.getByTestId('token-feedback-banner')).toContainText(
		/Konto wurde bestätigt|compte a été confirmé/
	);
	await expect
		.poll(() => page.url(), { timeout: 15000 })
		.not.toContain('confirmation_token=verify-123');

	expect(confirmationRequestPayload).toEqual({
		action: 'verifySignupLong',
		value: 'verify-123'
	});

	await page.getByTestId('token-feedback-dismiss').click();
	await expect(page.getByTestId('token-feedback-banner')).toBeHidden();
});

test('reactivation token in hash query shows inline error banner and clears params', async ({
	page
}) => {
	await mockBaseEntries(page);

	await page.route(/\/user-reactivation(?:\/)?(?:\?.*)?$/, async (route) => {
		await fulfillJson(
			route,
			{
				name: 'BadRequest',
				className: 'bad-request',
				code: 400,
				message: 'Invalid reactivation token.',
				data: { errorCode: 'REACTIVATION_TOKEN_INVALID' }
			},
			400
		);
	});

	await page.goto('/#/?user_id=12&reactivation_token=invalid');

	await expect(page.getByTestId('token-feedback-banner')).toBeVisible({ timeout: 15000 });
	// The server's English `message` is never rendered: the banner shows the
	// localized text resolved from `data.errorCode`.
	await expect(page.getByTestId('token-feedback-banner')).toContainText(
		/Reaktivierungs-Link ist ungültig|lien de réactivation n'est pas valide/
	);
	await expect(page.getByTestId('token-feedback-banner')).not.toContainText(
		'Invalid reactivation token.'
	);
	await expect
		.poll(() => page.url(), { timeout: 15000 })
		.not.toContain('reactivation_token=invalid');
});

test('farm detail contact form sends entrycontactmessage, toasts, and returns to the profile', async ({
	page
}) => {
	await mockBaseEntries(page);

	await page.route(/\/farms\/24(?:\/)?(?:\?.*)?$/, (route) =>
		fulfillJson(route, createFarmDetail('24', 'Farm 24'))
	);

	let contactPayload: unknown = null;
	await page.route(/\/entrycontactmessage(?:\/)?(?:\?.*)?$/, async (route) => {
		contactPayload = route.request().postDataJSON();
		await fulfillJson(route, {
			id: '24',
			type: 'Farm',
			senderName: 'Jane',
			senderEmail: 'jane@example.com',
			text: 'Hello from browser test'
		});
	});

	await page.goto('/#/farms/24');
	await expect(page.getByRole('heading', { name: 'Farm 24' })).toBeVisible({ timeout: 15000 });

	// The CTA opens a dedicated contact view (Feature 5): the profile sections are
	// replaced, the entry name stays visible in the header, and a back button returns.
	await page.getByTestId('entry-contact-toggle').click();
	await expect(page.getByTestId('entry-contact-form')).toBeVisible();
	await expect(page.getByTestId('entry-contact-back')).toBeVisible();

	await page.locator('#entry-contact-sender-name').fill('Jane');
	await page.locator('#entry-contact-sender-email').fill('jane@example.com');
	await page.getByTestId('entry-contact-message').fill('Hello from browser test');
	await page.getByTestId('entry-contact-submit').click();

	// Success: a sonner toast and a return to the profile (contact form unmounted).
	await expect(
		page.locator('[data-sonner-toast]').filter({ hasText: 'Deine Nachricht wurde gesendet.' })
	).toBeVisible({ timeout: 15000 });
	await expect(page.getByTestId('entry-contact-form')).toBeHidden();
	await expect(page.getByRole('heading', { name: 'Farm 24' })).toBeVisible();
	expect(contactPayload).toEqual({
		id: '24',
		type: 'Farm',
		senderName: 'Jane',
		senderEmail: 'jane@example.com',
		text: 'Hello from browser test'
	});
});

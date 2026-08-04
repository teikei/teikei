import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import FormErrorAlert from './FormErrorAlert.svelte';

describe('FormErrorAlert', () => {
	// The alert used to split its prop on commas and treat each fragment as a
	// message key, re-joining them without the separator. Localized prose has to
	// survive intact.
	it('renders a localized message containing commas verbatim', async () => {
		const message = 'Die E-Mail-Adresse oder das Passwort ist falsch, bitte versuche es erneut.';
		const view = render(FormErrorAlert, { props: { error: message } });

		await expect.element(view.getByRole('alert')).toHaveTextContent(message);
	});

	it('renders nothing without an error', () => {
		const view = render(FormErrorAlert, { props: { error: undefined } });

		expect(view.container.querySelector('[data-slot="alert"]')).toBeNull();
	});
});

import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import * as m from '$lib/paraglide/messages.js';
import FormInput from './FormInput.svelte';

describe('FormInput', () => {
	// The field components still receive raw zod keys from editor-schema.ts, so
	// they must keep translating — unlike FormErrorAlert, which now gets prose.
	it('resolves a zod validation key to localized text', async () => {
		const view = render(FormInput, {
			props: { id: 'name', label: 'Name', error: 'forms_validation_required' }
		});

		await expect.element(view.getByRole('alert')).toHaveTextContent(m.forms_validation_required());
	});

	it('resolves every key of a comma-separated list', async () => {
		const view = render(FormInput, {
			props: {
				id: 'url',
				label: 'Website',
				error: 'forms_validation_required,editor_error_invalid_url'
			}
		});

		const alert = view.getByRole('alert');
		await expect.element(alert).toHaveTextContent(m.forms_validation_required());
		await expect.element(alert).toHaveTextContent(m.editor_error_invalid_url());
	});
});

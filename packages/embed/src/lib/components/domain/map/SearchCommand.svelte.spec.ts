import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import SearchCommand from './SearchCommand.svelte';

// Keep the test page from following the suggestion links.
const preventNavigation = (event: MouseEvent) => event.preventDefault();

describe('SearchCommand', () => {
	beforeEach(() => document.addEventListener('click', preventNavigation));
	afterEach(() => document.removeEventListener('click', preventNavigation));

	it('clears the query when a suggestion is selected, so the parent closes the panel', async () => {
		const view = render(SearchCommand, {
			props: {
				searchValue: 'Berlin',
				suggestions: [{ id: 'loc-berlin', title: 'Berlin, Deutschland', type: 'location' }],
				open: true,
				placeholder: 'Suchen'
			}
		});

		await view.getByText('Berlin, Deutschland').click();

		await expect.element(view.getByRole('combobox', { name: 'Suchen' })).toHaveValue('');
	});
});

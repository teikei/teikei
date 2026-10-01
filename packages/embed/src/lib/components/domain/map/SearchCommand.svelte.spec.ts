import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { networkSelection } from '$lib/stores/network-selection.svelte';
import SearchCommand from './SearchCommand.svelte';

// Keep the test page from following the suggestion links.
const preventNavigation = (event: MouseEvent) => event.preventDefault();

describe('SearchCommand', () => {
	beforeEach(() => document.addEventListener('click', preventNavigation));
	afterEach(() => document.removeEventListener('click', preventNavigation));

	it('clears the query and depot emphasis when a suggestion is selected', async () => {
		networkSelection.selectDepot('depot-1');
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
		expect(networkSelection.selectedDepotId).toBeNull();
	});
});

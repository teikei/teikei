<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SearchCommand from './SearchCommand.svelte';
	import type { AutocompleteSuggestion } from '$lib/api/discovery';

	const { Story } = defineMeta({
		title: 'App/Map Sidebar/SearchCommand',
		component: SearchCommand,
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Command-style search field with an anchored results panel that overlays the entry list. Suggestions are grouped by type (Locations / Farms / Depots / Initiatives) with icons and support listbox keyboard navigation. Stories pass static suggestions and a no-op select handler.'
				}
			}
		}
	});

	const suggestions: AutocompleteSuggestion[] = [
		{ id: 'loc-berlin', title: 'Berlin, Germany', type: 'location' },
		{ id: 'loc-munich', title: 'Munich, Germany', type: 'location' },
		{ id: 'farm-main', title: 'Farm Main', type: 'farm' },
		{ id: 'depot-central', title: 'Central Depot', type: 'depot' },
		{ id: 'init-food', title: 'Food Coop Initiative', type: 'initiative' }
	];
</script>

<Story name="Grouped Results" asChild>
	<div class="w-sm pb-72">
		<SearchCommand searchValue="be" {suggestions} open />
	</div>
</Story>

<Story name="Loading" asChild>
	<div class="w-sm pb-24">
		<SearchCommand searchValue="be" suggestions={[]} open isLoading />
	</div>
</Story>

<Story name="Empty" asChild>
	<div class="w-sm pb-24">
		<SearchCommand searchValue="xyz" suggestions={[]} open />
	</div>
</Story>

<Story name="Closed" asChild>
	<div class="w-sm">
		<SearchCommand searchValue="" {suggestions} />
	</div>
</Story>

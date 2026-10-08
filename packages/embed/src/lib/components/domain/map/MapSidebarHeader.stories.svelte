<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MapSidebarHeader from './MapSidebarHeader.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { RegionOption } from '$lib/utils/regions';

	const { Story } = defineMeta({
		title: 'App/Map Sidebar/MapSidebarHeader',
		component: MapSidebarHeader,
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Scope switch (signed-in only), collapse toggle, search and region filters. Stories use static options and no-op handlers.'
				}
			}
		}
	});

	const countryOptions: RegionOption[] = [
		{ value: 'DE', label: 'Germany' },
		{ value: 'AT', label: 'Austria' }
	];
	const stateOptions: RegionOption[] = [
		{ value: 'BB', label: 'Brandenburg' },
		{ value: 'BE', label: 'Berlin' }
	];
	const noop = () => {};
</script>

{#snippet header(isUserAuthenticated: boolean)}
	<div class="w-sm rounded-4xl border bg-sidebar">
		<Sidebar.Provider open class="min-h-0">
			<MapSidebarHeader
				{isUserAuthenticated}
				searchSuggestions={[]}
				{countryOptions}
				{stateOptions}
				selectedCountry="DE"
				selectedState={null}
				onOpenAllEntriesScope={noop}
				onOpenMyEntriesScope={noop}
				onCountrySelect={noop}
				onStateSelect={noop}
			/>
		</Sidebar.Provider>
	</div>
{/snippet}

<Story name="Signed Out" asChild>
	{@render header(false)}
</Story>

<Story name="Signed In" asChild>
	{@render header(true)}
</Story>

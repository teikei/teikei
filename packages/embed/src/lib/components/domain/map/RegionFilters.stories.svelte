<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RegionFilters from './RegionFilters.svelte';
	import type { RegionOption } from '$lib/utils/regions';

	const { Story } = defineMeta({
		title: 'App/Map Sidebar/RegionFilters',
		component: RegionFilters,
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Country and region select pair used in the map sidebar header to scope entries to an area. Stories use static options and no-op handlers.'
				}
			}
		}
	});

	const countryOptions: RegionOption[] = [
		{ value: 'DE', label: 'Germany' },
		{ value: 'AT', label: 'Austria' },
		{ value: 'CH', label: 'Switzerland' }
	];

	const stateOptions: RegionOption[] = [
		{ value: 'BB', label: 'Brandenburg' },
		{ value: 'BE', label: 'Berlin' },
		{ value: 'SN', label: 'Saxony' }
	];

	const noop = () => {};
</script>

<Story name="With Regions" asChild>
	<div class="w-sm">
		<RegionFilters
			{countryOptions}
			{stateOptions}
			selectedCountry="DE"
			selectedState="BB"
			onCountrySelect={noop}
			onStateSelect={noop}
		/>
	</div>
</Story>

<Story name="No Region Selected" asChild>
	<div class="w-sm">
		<RegionFilters
			{countryOptions}
			{stateOptions}
			selectedCountry="DE"
			selectedState={null}
			onCountrySelect={noop}
			onStateSelect={noop}
		/>
	</div>
</Story>

<Story name="Region Disabled" asChild>
	<div class="w-sm">
		<RegionFilters
			{countryOptions}
			stateOptions={[]}
			selectedCountry="CH"
			selectedState={null}
			onCountrySelect={noop}
			onStateSelect={noop}
		/>
	</div>
</Story>

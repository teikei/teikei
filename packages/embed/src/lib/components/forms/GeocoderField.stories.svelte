<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GeocoderField from './GeocoderField.svelte';
	import { createEmptyCommonForm } from '$lib/utils/editor-form';

	const { Story } = defineMeta({
		title: 'Design System/Forms/GeocoderField',
		component: GeocoderField,
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Single geocoder search field replacing individual address/lat/lon inputs. Selecting a suggestion writes the hidden address, coordinate, and region fields; typed-but-unselected text never counts as a location. Stories show static field values — in the app, suggestions come from `getAutocompleteSuggestions()` and a selection is resolved via `geocodeLocationId()`.'
				}
			}
		}
	});

	const emptyFields = createEmptyCommonForm();

	const filledFields = {
		...createEmptyCommonForm(),
		address: 'Hofweg 1',
		street: 'Hofweg',
		housenumber: '1',
		city: 'Templin',
		postalcode: '17268',
		state: 'Brandenburg',
		country: 'Germany',
		latitude: '53.12',
		longitude: '13.51'
	};

	const noop = () => {};
</script>

<Story name="Empty" asChild>
	<div class="w-sm">
		<GeocoderField
			id="story-empty-geocoder"
			label="Adresse"
			testIdPrefix="story-empty"
			markerType="Farm"
			fields={emptyFields}
			onFieldChange={noop}
		/>
	</div>
</Story>

<Story name="Filled" asChild>
	<div class="w-sm">
		<GeocoderField
			id="story-filled-geocoder"
			label="Adresse"
			testIdPrefix="story-filled"
			markerType="Farm"
			fields={filledFields}
			onFieldChange={noop}
		/>
	</div>
</Story>

<Story name="With Error" asChild>
	<div class="w-sm">
		<GeocoderField
			id="story-error-geocoder"
			label="Adresse"
			testIdPrefix="story-error"
			markerType="Depot"
			fields={emptyFields}
			onFieldChange={noop}
			error="Bitte eine Adresse eingeben und aus der Liste auswählen."
		/>
	</div>
</Story>

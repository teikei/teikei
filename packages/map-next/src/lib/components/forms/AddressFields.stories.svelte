<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AddressFields from './AddressFields.svelte';
	import { createEmptyCommonForm } from '$lib/utils/editor-form';

	const { Story } = defineMeta({
		title: 'Design System/Forms/AddressFields',
		component: AddressFields,
		tags: ['autodocs'],
		parameters: {
			docs: {
				description: {
					component:
						'Shared address and coordinate inputs used by every entry editor. Stories use static field values and no-op handlers; in the app the fields are wired to a superforms store.'
				}
			}
		}
	});

	const emptyFields = createEmptyCommonForm();

	const filledFields = {
		...createEmptyCommonForm(),
		name: 'Example Farm Cooperative',
		city: 'Templin',
		postalcode: '17268',
		country: 'Germany',
		state: 'Brandenburg',
		address: 'Hofweg 1',
		street: 'Hofweg',
		housenumber: '1',
		latitude: '53.12',
		longitude: '13.51'
	};

	const noop = () => {};
</script>

<Story name="Empty" asChild>
	<div class="flex w-sm flex-col gap-4">
		<AddressFields
			fields={emptyFields}
			idPrefix="story-empty"
			testIdPrefix="story-empty"
			onFieldChange={noop}
		/>
	</div>
</Story>

<Story name="Filled" asChild>
	<div class="flex w-sm flex-col gap-4">
		<AddressFields
			fields={filledFields}
			idPrefix="story-filled"
			testIdPrefix="story-filled"
			onFieldChange={noop}
		/>
	</div>
</Story>

<Story name="With Errors" asChild>
	<div class="flex w-sm flex-col gap-4">
		<AddressFields
			fields={filledFields}
			idPrefix="story-errors"
			testIdPrefix="story-errors"
			onFieldChange={noop}
			errors={{
				postalcode: 'Enter a valid postal code.',
				latitude: 'Latitude must be between -90 and 90.'
			}}
		/>
	</div>
</Story>

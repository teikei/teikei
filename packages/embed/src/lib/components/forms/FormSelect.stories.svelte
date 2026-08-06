<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormSelect from './FormSelect.svelte';

	const countryOptions = [
		{ value: 'de', label: 'Germany' },
		{ value: 'at', label: 'Austria' },
		{ value: 'ch', label: 'Switzerland' }
	];

	const { Story } = defineMeta({
		title: 'Design System/Forms/FormSelect',
		component: FormSelect,
		tags: ['autodocs'],
		argTypes: {
			id: {
				control: 'text'
			},
			label: {
				control: 'text'
			},
			value: {
				control: 'text'
			},
			placeholder: {
				control: 'text'
			},
			description: {
				control: 'text'
			},
			error: {
				control: 'text'
			},
			options: {
				control: 'object'
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		id: 'story-country',
		label: 'Country',
		options: countryOptions,
		value: undefined,
		placeholder: 'Select a country',
		description: undefined,
		error: undefined
	}}
>
	{#snippet template(args)}
		<div class="w-sm">
			<FormSelect {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="With Description"
	args={{
		id: 'story-country-description',
		label: 'Country',
		options: countryOptions,
		value: 'de',
		placeholder: 'Select a country',
		description: 'Used to filter regional entry suggestions.',
		error: undefined
	}}
>
	{#snippet template(args)}
		<div class="w-sm">
			<FormSelect {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="Invalid"
	args={{
		id: 'story-country-invalid',
		label: 'Country',
		options: countryOptions,
		value: undefined,
		placeholder: 'Select a country',
		description: undefined,
		error: 'Please select a country.'
	}}
>
	{#snippet template(args)}
		<div class="w-sm">
			<FormSelect {...args} />
		</div>
	{/snippet}
</Story>

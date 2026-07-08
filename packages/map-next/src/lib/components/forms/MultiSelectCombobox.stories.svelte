<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MultiSelectCombobox from './MultiSelectCombobox.svelte';

	const farmOptions = [
		{ value: 'farm-1', label: 'Solawi Beispielhof' },
		{ value: 'farm-2', label: 'Gärtnerei Grünzeug' },
		{ value: 'farm-3', label: 'Hof am Bach' },
		{ value: 'farm-4', label: 'Marktgarten Sonnenfeld' },
		{ value: 'farm-5', label: 'Biolandhof Eichenkamp' }
	];

	const { Story } = defineMeta({
		title: 'Design System/Forms/MultiSelectCombobox',
		component: MultiSelectCombobox,
		tags: ['autodocs'],
		argTypes: {
			id: { control: 'text' },
			placeholder: { control: 'text' },
			emptyText: { control: 'text' },
			removeLabel: { control: 'text' },
			disabled: { control: 'boolean' },
			invalid: { control: 'boolean' },
			options: { control: 'object' },
			value: { control: 'object' }
		}
	});
</script>

<Story
	name="Default"
	args={{
		id: 'story-farms',
		options: farmOptions,
		value: [],
		placeholder: 'Höfe suchen …',
		emptyText: 'Keine Höfe gefunden.',
		removeLabel: 'Entfernen',
		disabled: false,
		invalid: false
	}}
>
	{#snippet template(args)}
		<div class="w-sm">
			<MultiSelectCombobox {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="With Selection"
	args={{
		id: 'story-farms-selected',
		options: farmOptions,
		value: ['farm-1', 'farm-3'],
		placeholder: 'Höfe suchen …',
		emptyText: 'Keine Höfe gefunden.',
		removeLabel: 'Entfernen',
		disabled: false,
		invalid: false
	}}
>
	{#snippet template(args)}
		<div class="w-sm">
			<MultiSelectCombobox {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="Invalid"
	args={{
		id: 'story-farms-invalid',
		options: farmOptions,
		value: [],
		placeholder: 'Höfe suchen …',
		emptyText: 'Keine Höfe gefunden.',
		removeLabel: 'Entfernen',
		disabled: false,
		invalid: true
	}}
>
	{#snippet template(args)}
		<div class="w-sm">
			<MultiSelectCombobox {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="Disabled"
	args={{
		id: 'story-farms-disabled',
		options: farmOptions,
		value: ['farm-2'],
		placeholder: 'Höfe suchen …',
		emptyText: 'Keine Höfe gefunden.',
		removeLabel: 'Entfernen',
		disabled: true,
		invalid: false
	}}
>
	{#snippet template(args)}
		<div class="w-sm">
			<MultiSelectCombobox {...args} />
		</div>
	{/snippet}
</Story>

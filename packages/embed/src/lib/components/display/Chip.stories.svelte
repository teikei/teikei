<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Chip from './Chip.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Display/Chip',
		component: Chip,
		tags: ['autodocs'],
		argTypes: {
			tint: {
				control: 'inline-radio',
				options: ['food', 'success', 'warning', 'destructive']
			}
		}
	});
</script>

<Story name="Food" args={{ tint: 'food' }}>
	{#snippet template(args)}
		<Chip {...args}>Gemüse</Chip>
	{/snippet}
</Story>

<Story name="Success" args={{ tint: 'success' }}>
	{#snippet template(args)}
		<Chip {...args}>Plätze frei</Chip>
	{/snippet}
</Story>

<Story name="Warning" args={{ tint: 'warning' }}>
	{#snippet template(args)}
		<Chip {...args}>Warteliste</Chip>
	{/snippet}
</Story>

<Story name="Destructive" args={{ tint: 'destructive' }}>
	{#snippet template(args)}
		<Chip {...args}>Ausgebucht</Chip>
	{/snippet}
</Story>

<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Ellipsis, PanelLeft, X } from '@lucide/svelte';
	import IconButton from './IconButton.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Actions/IconButton',
		component: IconButton,
		tags: ['autodocs'],
		argTypes: {
			label: {
				control: 'text'
			},
			variant: {
				control: 'inline-radio',
				options: ['default', 'outline']
			},
			disabled: {
				control: 'boolean'
			}
		}
	});
</script>

<Story name="Sidebar Toggle" args={{ label: 'Toggle sidebar', disabled: false }}>
	{#snippet template(args)}
		<IconButton {...args}>
			<PanelLeft class="size-4" />
		</IconButton>
	{/snippet}
</Story>

<Story name="Close" args={{ label: 'Close', disabled: false }}>
	{#snippet template(args)}
		<IconButton {...args}>
			<X class="size-4" />
		</IconButton>
	{/snippet}
</Story>

<Story name="Overflow" args={{ label: 'Open row actions', disabled: false }}>
	{#snippet template(args)}
		<IconButton {...args}>
			<Ellipsis class="size-4" />
		</IconButton>
	{/snippet}
</Story>

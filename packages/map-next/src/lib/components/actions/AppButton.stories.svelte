<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AppButton from './AppButton.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Actions/AppButton',
		component: AppButton,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'inline-radio',
				options: ['default', 'outline', 'destructive', 'ghost']
			},
			disabled: {
				control: 'boolean'
			}
		}
	});
</script>

<Story name="Default" args={{ variant: 'default', disabled: false }}>
	{#snippet template(args)}
		<AppButton {...args}>Save changes</AppButton>
	{/snippet}
</Story>

<Story name="Outline" args={{ variant: 'outline', disabled: false }}>
	{#snippet template(args)}
		<AppButton {...args}>Cancel</AppButton>
	{/snippet}
</Story>

<Story name="Disabled" args={{ variant: 'default', disabled: true }}>
	{#snippet template(args)}
		<AppButton {...args}>Saving</AppButton>
	{/snippet}
</Story>

<Story name="Destructive" args={{ variant: 'destructive', disabled: false }}>
	{#snippet template(args)}
		<AppButton {...args}>Löschen</AppButton>
	{/snippet}
</Story>

<Story name="Ghost" args={{ variant: 'ghost', disabled: false }}>
	{#snippet template(args)}
		<AppButton {...args}>Abbrechen</AppButton>
	{/snippet}
</Story>

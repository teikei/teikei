<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormSubmitButton from './FormSubmitButton.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Forms/FormSubmitButton',
		component: FormSubmitButton,
		tags: ['autodocs'],
		argTypes: {
			isLoading: { control: 'boolean' },
			loadingLabel: { control: 'text' }
		}
	});
</script>

<Story name="Default" args={{ isLoading: false }}>
	{#snippet template(args)}
		<FormSubmitButton isLoading={args.isLoading} loadingLabel={args.loadingLabel}
			>Anmelden</FormSubmitButton
		>
	{/snippet}
</Story>

<Story name="Loading" args={{ isLoading: true }}>
	{#snippet template(args)}
		<FormSubmitButton isLoading={args.isLoading} loadingLabel={args.loadingLabel}
			>Anmelden</FormSubmitButton
		>
	{/snippet}
</Story>

<Story name="Loading With Label" args={{ isLoading: true, loadingLabel: 'Anmelden …' }}>
	{#snippet template(args)}
		<FormSubmitButton isLoading={args.isLoading} loadingLabel={args.loadingLabel}
			>Anmelden</FormSubmitButton
		>
	{/snippet}
</Story>

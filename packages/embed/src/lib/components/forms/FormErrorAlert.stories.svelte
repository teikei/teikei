<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormErrorAlert from './FormErrorAlert.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Forms/FormErrorAlert',
		component: FormErrorAlert,
		tags: ['autodocs'],
		argTypes: {
			error: {
				control: 'text'
			}
		}
	});
</script>

<Story name="Error" args={{ error: 'Something went wrong. Please try again.' }}>
	{#snippet template(args)}
		<div class="w-md">
			<FormErrorAlert {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Hidden Without Error" args={{ error: undefined }}>
	{#snippet template(args)}
		<div class="w-md">
			<FormErrorAlert {...args} />
		</div>
	{/snippet}
</Story>

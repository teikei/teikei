<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormTextarea from './FormTextarea.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Forms/FormTextarea',
		component: FormTextarea,
		tags: ['autodocs'],
		argTypes: {
			label: { control: 'text' },
			value: { control: 'text' },
			description: { control: 'text' },
			error: { control: 'text' },
			rows: { control: 'number' }
		}
	});
</script>

<Story
	name="Default"
	args={{
		id: 'story-form-textarea-description',
		label: 'Description',
		value: 'A short description of the entry.',
		rows: 4
	}}
>
	{#snippet template(args)}
		<div class="max-w-md">
			<FormTextarea {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="With Description"
	args={{
		id: 'story-form-textarea-notes',
		label: 'Notes',
		value: '',
		description: 'Use concise text that can be scanned quickly.',
		rows: 3
	}}
>
	{#snippet template(args)}
		<div class="max-w-md">
			<FormTextarea {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="Invalid"
	args={{
		id: 'story-form-textarea-invalid',
		label: 'Description',
		value: '',
		error: 'Description is required',
		rows: 4
	}}
>
	{#snippet template(args)}
		<div class="max-w-md">
			<FormTextarea {...args} />
		</div>
	{/snippet}
</Story>

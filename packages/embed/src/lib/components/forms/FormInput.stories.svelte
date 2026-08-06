<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormInput from './FormInput.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Forms/FormInput',
		component: FormInput,
		tags: ['autodocs'],
		argTypes: {
			id: {
				control: 'text'
			},
			label: {
				control: 'text'
			},
			type: {
				control: 'text'
			},
			value: {
				control: 'text'
			},
			error: {
				control: 'text'
			}
		}
	});
</script>

<Story
	name="Default"
	args={{ id: 'story-email', label: 'Email', type: 'email', value: '', error: undefined }}
>
	{#snippet template(args)}
		<div class="w-sm">
			<FormInput {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="With Value"
	args={{
		id: 'story-name',
		label: 'Name',
		type: 'text',
		value: 'Solawi Beispielhof',
		error: undefined
	}}
>
	{#snippet template(args)}
		<div class="w-sm">
			<FormInput {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="Invalid"
	args={{
		id: 'story-invalid-email',
		label: 'Email',
		type: 'email',
		value: 'invalid',
		error: 'Please enter a valid email address.'
	}}
>
	{#snippet template(args)}
		<div class="w-sm">
			<FormInput {...args} />
		</div>
	{/snippet}
</Story>

<!-- Password fields render a show/hide visibility toggle automatically. -->
<Story
	name="Password"
	args={{
		id: 'story-password',
		label: 'Password',
		type: 'password',
		value: 'correct horse battery staple',
		required: true,
		error: undefined
	}}
>
	{#snippet template(args)}
		<div class="w-sm">
			<FormInput {...args} />
		</div>
	{/snippet}
</Story>

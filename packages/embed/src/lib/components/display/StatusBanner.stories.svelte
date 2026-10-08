<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatusBanner from './StatusBanner.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Display/StatusBanner',
		component: StatusBanner,
		tags: ['autodocs'],
		args: { ondismiss: () => {} },
		argTypes: {
			status: {
				control: 'inline-radio',
				options: ['success', 'error']
			}
		}
	});
</script>

<Story
	name="Success"
	args={{ status: 'success', message: 'Vielen Dank! Dein Konto wurde bestätigt.' }}
>
	{#snippet template(args)}
		<div class="w-md">
			<StatusBanner {...args} />
		</div>
	{/snippet}
</Story>

<Story
	name="Error"
	args={{ status: 'error', message: 'Dein Konto konnte nicht reaktiviert werden.' }}
>
	{#snippet template(args)}
		<div class="w-md">
			<StatusBanner {...args} />
		</div>
	{/snippet}
</Story>

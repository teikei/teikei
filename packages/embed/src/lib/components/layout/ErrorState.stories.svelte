<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorState from './ErrorState.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Layout/ErrorState',
		component: ErrorState,
		tags: ['autodocs']
	});
</script>

<Story name="Default" />

<Story name="With Retry" args={{ onRetry: () => {} }} />

<Story
	name="Custom Copy"
	args={{
		title: 'Eintrag nicht gefunden',
		description: 'Der Eintrag wurde möglicherweise gelöscht.'
	}}
/>

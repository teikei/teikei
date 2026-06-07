<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InitiativeDetail from './InitiativeDetail.svelte';
	import { storyInitiativeProperties } from '../entries/story-fixtures';

	const { Story } = defineMeta({
		title: 'App/Map Sidebar/InitiativeDetail',
		component: InitiativeDetail,
		tags: ['autodocs'],
		args: {
			properties: storyInitiativeProperties
		}
	});
</script>

<Story name="Complete">
	<div class="w-md rounded-md border bg-background p-4">
		<InitiativeDetail properties={storyInitiativeProperties} />
	</div>
</Story>

<Story name="Without Badges">
	<div class="w-md rounded-md border bg-background p-4">
		<InitiativeDetail properties={{ ...storyInitiativeProperties, badges: null }} />
	</div>
</Story>

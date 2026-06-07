<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EntryCard from './EntryCard.svelte';
	import {
		storyDepotProperties,
		storyFarmProperties,
		storyInitiativeProperties
	} from './story-fixtures';

	const { Story } = defineMeta({
		title: 'App/Map Sidebar/EntryCard',
		component: EntryCard,
		tags: ['autodocs'],
		args: {
			entry: storyFarmProperties
		}
	});
</script>

<Story name="Farm">
	<div class="flex w-sm items-center rounded-md border bg-background p-3">
		<EntryCard entry={storyFarmProperties} />
	</div>
</Story>

<Story name="Depot">
	<div class="flex w-sm items-center rounded-md border bg-background p-3">
		<EntryCard entry={storyDepotProperties} />
	</div>
</Story>

<Story name="Initiative">
	<div class="flex w-sm items-center rounded-md border bg-background p-3">
		<EntryCard entry={storyInitiativeProperties} />
	</div>
</Story>

<Story name="Long Text">
	<div class="flex w-xs items-center rounded-md border bg-background p-3">
		<EntryCard
			entry={{
				...storyFarmProperties,
				name: 'Very Long Cooperative Farm Name That Should Truncate In Narrow Sidebars',
				city: 'A Very Long Municipality Name'
			}}
		/>
	</div>
</Story>

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

<Story name="Farm" asChild>
	<div class="w-sm rounded-md border bg-background p-3">
		<EntryCard entry={{ ...storyFarmProperties, acceptsNewMembers: 'yes' }} />
	</div>
</Story>

<Story name="Farm — waitlist" asChild>
	<div class="w-sm rounded-md border bg-background p-3">
		<EntryCard entry={{ ...storyFarmProperties, acceptsNewMembers: 'waitlist' }} />
	</div>
</Story>

<Story name="Farm — closed" asChild>
	<div class="w-sm rounded-md border bg-background p-3">
		<EntryCard entry={{ ...storyFarmProperties, acceptsNewMembers: 'no' }} />
	</div>
</Story>

<Story name="Depot" asChild>
	<div class="w-sm rounded-md border bg-background p-3">
		<EntryCard entry={storyDepotProperties} />
	</div>
</Story>

<Story name="Initiative" asChild>
	<div class="w-sm rounded-md border bg-background p-3">
		<EntryCard entry={storyInitiativeProperties} />
	</div>
</Story>

<Story name="Long Text" asChild>
	<div class="w-xs rounded-md border bg-background p-3">
		<EntryCard
			entry={{
				...storyFarmProperties,
				name: 'Very Long Cooperative Farm Name That Should Truncate In Narrow Sidebars',
				city: 'A Very Long Municipality Name'
			}}
		/>
	</div>
</Story>

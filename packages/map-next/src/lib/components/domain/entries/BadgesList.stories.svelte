<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BadgesList from './BadgesList.svelte';
	import { storyAssociationBadge, storyCertificationBadge } from './story-fixtures';

	const { Story } = defineMeta({
		title: 'App/Map Sidebar/BadgesList',
		component: BadgesList,
		tags: ['autodocs'],
		args: {
			badges: [storyAssociationBadge, storyCertificationBadge],
			category: 'associations'
		}
	});
</script>

<Story name="Associations" asChild>
	<div class="w-sm rounded-md border bg-background p-4">
		<BadgesList badges={[storyAssociationBadge, storyCertificationBadge]} category="associations" />
	</div>
</Story>

<Story name="Certifications" asChild>
	<div class="w-sm rounded-md border bg-background p-4">
		<BadgesList
			badges={[storyAssociationBadge, storyCertificationBadge]}
			category="certifications"
		/>
	</div>
</Story>

<Story name="Empty" asChild>
	<div class="w-sm rounded-md border bg-background p-4">
		<BadgesList badges={[]} category="associations" />
	</div>
</Story>

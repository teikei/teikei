<script lang="ts">
	import type { InitiativeDetailProperties } from '$lib/types/place-details';
	import { translateGoal } from '$lib/utils/translations';
	import BadgesList from './BadgesList.svelte';

	interface InitiativeDetailProps {
		properties: InitiativeDetailProperties;
	}

	let { properties }: InitiativeDetailProps = $props();
</script>

<div class="space-y-4">
	<!-- Goals -->
	{#if properties.goals && properties.goals.length > 0}
		<ul class="list-inside list-disc text-sm text-muted-foreground">
			{#each properties.goals as goal (goal.id)}
				<li>{translateGoal(goal.name)}</li>
			{/each}
		</ul>
	{/if}

	<!-- Badges -->
	<BadgesList badges={properties.badges} category="associations" />
	<BadgesList badges={properties.badges} category="certifications" />
</div>

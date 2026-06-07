<script lang="ts">
	import type { InitiativeProperties } from '$lib/types/entries';
	import { translateGoal } from '$lib/utils/translations';
	import BadgesList from '../entries/BadgesList.svelte';

	interface InitiativeDetailProps {
		properties: InitiativeProperties;
	}

	let { properties }: InitiativeDetailProps = $props();
</script>

<div class="flex flex-col gap-4">
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

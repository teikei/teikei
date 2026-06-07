<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Badge } from '$lib/components/ui/badge';
	import type { Badge as BadgeData } from '$lib/types/entries';

	interface BadgesListProps {
		badges?: BadgeData[] | null;
		category: 'associations' | 'certifications';
	}

	let { badges, category }: BadgesListProps = $props();

	const filteredBadges = $derived((badges ?? []).filter((b) => b.category === category));

	const title = $derived(
		category === 'associations' ? m.places_details_badges() : m.places_details_certifications()
	);
</script>

{#if filteredBadges.length > 0}
	<div class="space-y-2">
		<h4 class="text-sm font-semibold">{title}</h4>
		<div class="flex flex-wrap gap-2">
			{#each filteredBadges as badge (badge.id)}
				{#if badge.url}
					<a
						href={badge.url}
						target="_blank"
						rel="noopener noreferrer"
						class="block"
						title={badge.name}
					>
						{#if badge.logo}
							<img src={badge.logo} alt={badge.name} class="h-10 w-auto object-contain" />
						{:else}
							<Badge variant="secondary">{badge.name}</Badge>
						{/if}
					</a>
				{:else if badge.logo}
					<img
						src={badge.logo}
						alt={badge.name}
						class="h-10 w-auto object-contain"
						title={badge.name}
					/>
				{:else}
					<span class="rounded bg-muted px-2 py-1 text-xs">{badge.name}</span>
				{/if}
			{/each}
		</div>
	</div>
{/if}

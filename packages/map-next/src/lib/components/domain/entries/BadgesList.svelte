<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Heading } from '$lib/components/typography';
	import type { Badge as BadgeData } from '$lib/types/entries';
	import { safeHttpUrl } from '$lib/utils/url';

	interface BadgesListProps {
		badges?: BadgeData[] | null;
		category: 'associations' | 'certifications';
		/** Hide the category sub-heading (e.g. when a section heading already covers it). */
		showTitle?: boolean;
	}

	let { badges, category, showTitle = true }: BadgesListProps = $props();

	const filteredBadges = $derived((badges ?? []).filter((b) => b.category === category));

	const title = $derived(
		category === 'associations' ? m.places_details_badges() : m.places_details_certifications()
	);
</script>

{#if filteredBadges.length > 0}
	<div class="flex flex-col gap-2">
		{#if showTitle}
			<Heading level={6}>{title}</Heading>
		{/if}
		<div class="flex flex-wrap gap-2">
			{#each filteredBadges as badge (badge.id)}
				{@const badgeUrl = safeHttpUrl(badge.url)}
				{#if badgeUrl}
					<a
						href={badgeUrl}
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

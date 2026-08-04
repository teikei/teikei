<script lang="ts">
	import type { EntryProperties } from '$lib/types/entries';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import { translateCategory, translateType } from '$lib/utils/translations';
	import { cn } from '$lib/utils/tailwind';
	import MembershipStatus from './MembershipStatus.svelte';

	interface EntryCardProps {
		entry: EntryProperties;
		iconSize?: string;
	}

	let { entry, iconSize = 'size-9' }: EntryCardProps = $props();

	const icon = $derived(getPlaceIcon(entry.type));
	const typeLabel = $derived(translateType(entry.type));

	function formatAddress(props: EntryProperties): string {
		const parts = [props.postalcode, props.city].filter(Boolean);
		return parts.join(' ');
	}

	const address = $derived(formatAddress(entry));

	// Membership status is a farm-only concept (colored dot + short label).
	const acceptsNewMembers = $derived(entry.type === 'Farm' ? entry.acceptsNewMembers : undefined);

	// Distinct product categories, translated, for a compact one-line summary.
	const productSummary = $derived.by(() => {
		if (entry.type !== 'Farm') return '';
		const categories: string[] = [];
		for (const product of entry.products ?? []) {
			const category = translateCategory(product.category);
			if (!categories.includes(category)) categories.push(category);
		}
		return categories.join(', ');
	});
</script>

<div class="flex w-full min-w-0 items-start gap-3 rounded-md transition-colors">
	<div class="flex shrink-0 items-center justify-center">
		<img class={cn(iconSize, 'object-contain')} src={icon} alt={typeLabel} />
	</div>
	<div class="flex min-w-0 flex-col gap-0.5">
		<span class="truncate font-medium text-foreground">{entry.name}</span>
		<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
			{#if acceptsNewMembers}
				<MembershipStatus {acceptsNewMembers} />
			{/if}
		</div>
		{#if address}
			<span class="truncate text-sm text-muted-foreground">{address}</span>
		{/if}
		{#if productSummary}
			<span class="truncate text-xs text-muted-foreground">{productSummary}</span>
		{/if}
	</div>
</div>

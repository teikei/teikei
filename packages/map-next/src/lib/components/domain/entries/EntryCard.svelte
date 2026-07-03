<script lang="ts">
	import type { AcceptsNewMembers, EntryProperties } from '$lib/types/entries';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import { translateCategory, translateType } from '$lib/utils/translations';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils/tailwind';
	import * as m from '$lib/paraglide/messages.js';

	interface EntryCardProps {
		entry: EntryProperties;
		iconSize?: string;
		highlighted?: boolean;
	}

	let { entry, iconSize = 'size-9', highlighted = false }: EntryCardProps = $props();

	const icon = $derived(getPlaceIcon(entry.type));
	const typeLabel = $derived(translateType(entry.type));

	function formatAddress(props: EntryProperties): string {
		const parts = [props.postalcode, props.city].filter(Boolean);
		return parts.join(' ');
	}

	const address = $derived(formatAddress(entry));

	// Membership status is a farm-only concept (colored dot + short label).
	const MEMBERSHIP: Record<AcceptsNewMembers, { label: () => string; dot: string; text: string }> = {
		yes: { label: m.map_card_membership_yes, dot: 'bg-success', text: 'text-success' },
		no: { label: m.map_card_membership_no, dot: 'bg-destructive', text: 'text-destructive' },
		waitlist: { label: m.map_card_membership_waitlist, dot: 'bg-warning', text: 'text-warning' }
	};

	const membership = $derived(
		entry.type === 'Farm' && entry.acceptsNewMembers
			? MEMBERSHIP[entry.acceptsNewMembers]
			: undefined
	);

	// Distinct product categories, translated, for a compact one-line summary.
	const productSummary = $derived.by(() => {
		if (entry.type !== 'Farm') return '';
		const categories = new Set<string>();
		for (const product of entry.products ?? []) {
			categories.add(translateCategory(product.category));
		}
		return [...categories].join(', ');
	});
</script>

<div
	class={cn(
		'flex w-full min-w-0 items-start gap-3 rounded-md transition-colors',
		highlighted && 'bg-muted'
	)}
	data-highlighted={highlighted ? '' : undefined}
>
	<div class="flex shrink-0 items-center justify-center">
		<img class={cn(iconSize, 'object-contain')} src={icon} alt={typeLabel} />
	</div>
	<div class="flex min-w-0 flex-col gap-0.5">
		<span class="truncate font-medium text-foreground">{entry.name}</span>
		<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
			<Badge variant="secondary">{typeLabel}</Badge>
			{#if membership}
				<span class={cn('inline-flex items-center gap-1 text-xs', membership.text)}>
					<span class={cn('size-2 shrink-0 rounded-full', membership.dot)}></span>
					{membership.label()}
				</span>
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

<script lang="ts">
	import { MarkerLayer } from 'svelte-maplibre';
	import type { EntryFeature } from '$lib/types/entries';
	import { asEntryFeature } from '$lib/utils/entry-features';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import { entryHoverKey, hoveredEntry } from '$lib/stores/hovered-entry.svelte';
	import { cn } from '$lib/utils/tailwind';
	import SymbolMarkerCluster from './SymbolMarkerCluster.svelte';

	interface SymbolMarkerLayerProps {
		onMarkerClick: (feature: EntryFeature, options?: { offset?: [number, number] }) => void;
		minzoom?: number;
		/** Entry ids to emphasize while a farm↔depot network is open (shared state). */
		highlightedIds?: ReadonlySet<string>;
	}

	let { onMarkerClick, minzoom, highlightedIds }: SymbolMarkerLayerProps = $props();
</script>

<!-- Cluster markers -->
<MarkerLayer applyToClusters {minzoom}>
	{#snippet children({ feature })}
		<SymbolMarkerCluster {feature} {onMarkerClick} />
	{/snippet}
</MarkerLayer>

<!-- Individual markers -->
<MarkerLayer applyToClusters={false} {minzoom}>
	{#snippet children({ feature })}
		{@const entry = asEntryFeature(feature)}
		{#if entry}
			{@const type = entry.properties.type.toLowerCase()}
			{@const isNetworkHighlighted = highlightedIds?.has(entry.properties.id) ?? false}
			{@const isHovered = hoveredEntry.key === entryHoverKey(entry.properties)}
			<button
				type="button"
				onclick={() => onMarkerClick(entry)}
				onmouseenter={() => hoveredEntry.setHover(entry.properties, 'map')}
				onmouseleave={() => hoveredEntry.clear(entry.properties)}
			>
				<img
					class={cn(
						'marker-icon',
						isNetworkHighlighted && 'marker-icon--network',
						isHovered && 'marker-icon--highlighted'
					)}
					src={getPlaceIcon(type)}
					alt={entry.properties.name || type}
				/>
			</button>
		{/if}
	{/snippet}
</MarkerLayer>

<style>
	.marker-icon {
		width: 30px;
		height: 30px;
		cursor: pointer;
		transition:
			transform 150ms ease,
			filter 150ms ease;
		transform-origin: bottom center;
	}

	.marker-icon--highlighted {
		transform: scale(1.3);
		filter: drop-shadow(0 2px 4px var(--overlay));
	}

	.marker-icon--network {
		transform: scale(1.25);
		filter: drop-shadow(0 0 4px var(--map-network-line));
	}
</style>

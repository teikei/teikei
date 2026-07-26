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
		/** Hover key of the entry whose profile is open; its marker stays selected. */
		selectedKey?: string | null;
	}

	let { onMarkerClick, minzoom, highlightedIds, selectedKey }: SymbolMarkerLayerProps = $props();
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
			{@const hoverKey = entryHoverKey(entry.properties)}
			{@const isHovered = hoveredEntry.key === hoverKey}
			{@const isSelected = selectedKey != null && selectedKey === hoverKey}
			<button
				type="button"
				onclick={() => onMarkerClick(entry)}
				onmouseenter={() => hoveredEntry.setHover(entry.properties, 'map')}
				onmouseleave={() => hoveredEntry.clear(entry.properties)}
				class={cn(
					'marker-button',
					isNetworkHighlighted && 'marker-button--network',
					isHovered && 'marker-button--highlighted',
					isSelected && 'marker-button--selected'
				)}
			>
				<img class="marker-icon" src={getPlaceIcon(type)} alt={entry.properties.name || type} />
			</button>
		{/if}
	{/snippet}
</MarkerLayer>

<style>
	.marker-button {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 45px;
		height: 45px;
		cursor: pointer;
		--marker-drop-shadow: drop-shadow(0 2px 5px var(--base-color-map-network));
	}

	.marker-icon {
		position: relative;
		width: 30px;
		height: 30px;
		transition:
			transform 150ms ease,
			filter 150ms ease;
		transform-origin: bottom center;
		filter: var(--marker-drop-shadow);
	}

	.marker-button--highlighted {
		transform: scale(1.3);
		filter: drop-shadow(0 2px 10px var(--base-color-map-network));
	}

	.marker-button--selected {
		transform: scale(1.3);
	}
</style>

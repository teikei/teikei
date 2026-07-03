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
	}

	let { onMarkerClick, minzoom }: SymbolMarkerLayerProps = $props();
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
			{@const highlighted = hoveredEntry.key === entryHoverKey(entry.properties)}
			<button
				type="button"
				onclick={() => onMarkerClick(entry)}
				onmouseenter={() => hoveredEntry.setHover(entry.properties, 'map')}
				onmouseleave={() => hoveredEntry.clear(entry.properties)}
			>
				<img
					class={cn('marker-icon', highlighted && 'marker-icon--highlighted')}
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
		filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--foreground) 35%, transparent));
	}
</style>

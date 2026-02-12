<script lang="ts">
	import { MarkerLayer, getMapContext, getSource } from 'svelte-maplibre';
	import type { FeatureCollection, Feature, Point } from 'geojson';
	import type { EntryProperties } from '$lib/types/entries';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import SymbolMarkerCluster from './SymbolMarkerCluster.svelte';

	interface SymbolMarkerLayerProps {
		onMarkerClick: (feature: Feature<Point, EntryProperties>) => void;
		entries: FeatureCollection;
	}

	let { onMarkerClick, entries, minzoom }: SymbolMarkerLayerProps = $props();
</script>

<!-- Cluster markers -->
<MarkerLayer id="entry-clusters" applyToClusters hoverCursor="pointer" {minzoom}>
	{#snippet children({ feature })}
		<SymbolMarkerCluster {feature} {onMarkerClick} />
	{/snippet}
</MarkerLayer>

<!-- Individual markers -->
<MarkerLayer id="entry-markers" applyToClusters={false} hoverCursor="pointer" {minzoom}>
	{#snippet children({ feature })}
		{@const type = feature.properties?.type?.toLowerCase()}
		{@const icon = getPlaceIcon(type)}
		<button onclick={() => onMarkerClick(feature)}>
			<img class="marker-icon" src={icon} alt={feature.properties?.name || type} />
		</button>
	{/snippet}
</MarkerLayer>

<style>
	.marker-icon {
		width: 30px;
		height: 30px;
		cursor: pointer;
	}
</style>

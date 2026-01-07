<script lang="ts">
	import { MarkerLayer, getMapContext, getSource } from 'svelte-maplibre';
	import type { FeatureCollection, Feature, Point } from 'geojson';
	import type { EntryProperties } from '$lib/types/entries';
	import type { GeoJSONSource } from 'maplibre-gl';
	import FarmIcon from '$lib/assets/markers/farm.svg';
	import InitiativeIcon from '$lib/assets/markers/initiative.svg';
	import DepotIcon from '$lib/assets/markers/depot.svg';
	import SymbolMarkerCluster from './SymbolMarkerCluster.svelte';

	interface SymbolMarkerLayerProps {
		onMarkerClick: (feature: Feature<Point, EntryProperties>) => void;
		entries: FeatureCollection;
	}

	let { onMarkerClick, entries }: SymbolMarkerLayerProps = $props();

	const markerIcons: Record<string, string> = {
		farm: FarmIcon,
		initiative: InitiativeIcon,
		depot: DepotIcon
	};
</script>

<!-- Cluster markers -->
<MarkerLayer
	id="entry-clusters"
	applyToClusters
	hoverCursor="pointer"
	onclick={(e) => {
		const feature = e.feature;
		if (feature && feature.geometry.type === 'Point') {
			onMarkerClick(feature as Feature<Point, EntryProperties>);
		}
	}}
>
	{#snippet children({ feature })}
		<SymbolMarkerCluster {feature} {markerIcons} />
	{/snippet}
</MarkerLayer>

<!-- Individual markers -->
<MarkerLayer
	id="entry-markers"
	applyToClusters={false}
	hoverCursor="pointer"
	onclick={(e) => {
		const feature = e.feature;
		if (feature && feature.geometry.type === 'Point') {
			onMarkerClick(feature as Feature<Point, EntryProperties>);
		}
	}}
>
	{#snippet children({ feature })}
		{@const type = feature.properties?.type?.toLowerCase()}
		{@const icon = markerIcons[type]}
		<img class="marker-icon" src={icon} alt={feature.properties?.name || type} />
	{/snippet}
</MarkerLayer>

<style>
	.marker-icon {
		width: 32px;
		height: 32px;
	}
</style>

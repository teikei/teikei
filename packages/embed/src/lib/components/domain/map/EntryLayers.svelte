<script lang="ts">
	import { CircleLayer, GeoJSON, getMapContext } from 'svelte-maplibre';
	import type { GeoJSONSource } from 'maplibre-gl';
	import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
	import type { MapDesignTokens } from '$lib/design/themes';
	import type { EntryFeature, EntryFeatureCollection } from '$lib/types/entries';
	import { asEntryFeature } from '$lib/utils/entry-features';
	import SymbolMarkerLayer from './SymbolMarkerLayer.svelte';

	// Below this zoom primary places render as circles, above it as symbol markers.
	const SYMBOL_MIN_ZOOM = 9.5;
	const BEFORE_ID = 'boundary-state';

	type MarkerOptions = { offset?: [number, number] };

	interface EntryLayersProps {
		entries: EntryFeatureCollection;
		theme: MapDesignTokens;
		zoom: number;
		circleBaseRadius: number;
		opacity?: number;
		/** Entry ids to emphasize while a farm↔depot network is open. */
		highlightedIds?: ReadonlySet<string>;
		/** Hover key of the entry whose profile is open; its marker stays selected. */
		selectedKey?: string | null;
		/** Depot drawn with an enlarged overlay while its popup is shown. */
		hoveredDepotId?: string | null;
		/** Receives entries as well as clusters, which carry no entry properties. */
		onFeatureClick: (
			feature: Feature<Geometry, GeoJsonProperties>,
			options?: MarkerOptions
		) => void;
		onEntryHover: (entry: EntryFeature, options?: MarkerOptions) => void;
		onLeave: () => void;
	}

	let {
		entries,
		theme,
		zoom,
		circleBaseRadius,
		opacity = 1,
		highlightedIds,
		selectedKey,
		hoveredDepotId,
		onFeatureClick,
		onEntryHover,
		onLeave
	}: EntryLayersProps = $props();

	const mapContext = getMapContext();

	const primaryPlaces = $derived({
		...entries,
		features: entries.features.filter(
			(feature) => feature.properties?.type === 'Farm' || feature.properties?.type === 'Initiative'
		)
	});

	const secondaryPlaces = $derived({
		...entries,
		features: entries.features.filter((feature) => feature.properties?.type === 'Depot')
	});

	function handleClick(feature: Feature<Geometry, GeoJsonProperties> | undefined) {
		if (feature) onFeatureClick(feature);
	}

	// Hovering a cluster circle previews its first entry.
	async function handleCircleHover(
		sourceId: string,
		feature: Feature<Geometry, GeoJsonProperties> | undefined
	) {
		if (!feature) {
			onLeave();
			return;
		}
		const entry = asEntryFeature(feature);
		if (entry) {
			onEntryHover(entry);
			return;
		}
		const clusterId = feature.properties?.cluster_id;
		const map = mapContext.map;
		if (clusterId == null || !map) return;
		const source = map.getSource(sourceId) as GeoJSONSource | undefined;
		if (!source?.getClusterLeaves) return;
		const leaves = await source.getClusterLeaves(clusterId, 1, 0);
		const first = asEntryFeature(leaves[0]);
		if (first) onEntryHover(first);
	}
</script>

<GeoJSON
	id="secondary-places"
	data={secondaryPlaces}
	cluster={zoom < 11 ? { radius: circleBaseRadius * 0.6 } : undefined}
>
	<CircleLayer
		id="secondary-points"
		beforeId={BEFORE_ID}
		paint={{
			'circle-color': theme.secondaryPlaceColor,
			'circle-radius': circleBaseRadius * 0.5,
			'circle-opacity': opacity
		}}
		hoverCursor="pointer"
		onclick={(e) => handleClick(e.features?.[0])}
		onmousemove={(e) => handleCircleHover('secondary-places', e.features?.[0])}
		onmouseleave={onLeave}
	/>
</GeoJSON>

<GeoJSON id="primary-places" data={primaryPlaces} cluster={{ radius: 3 + circleBaseRadius }}>
	<CircleLayer
		id="primary-clusters"
		beforeId={BEFORE_ID}
		filter={['has', 'point_count']}
		paint={{
			'circle-color': theme.primaryPlaceColor,
			'circle-radius': 3 + circleBaseRadius,
			'circle-opacity': opacity
		}}
		hoverCursor="pointer"
		applyToClusters
		maxzoom={SYMBOL_MIN_ZOOM}
		onclick={(e) => handleClick(e.features?.[0])}
		onmousemove={(e) => handleCircleHover('primary-places', e.features?.[0])}
		onmouseleave={onLeave}
	/>
	<CircleLayer
		id="primary-points"
		beforeId={BEFORE_ID}
		filter={['!', ['has', 'point_count']]}
		paint={{
			'circle-color': theme.primaryPlaceColor,
			'circle-radius': circleBaseRadius,
			'circle-opacity': opacity
		}}
		hoverCursor="pointer"
		maxzoom={SYMBOL_MIN_ZOOM}
		onclick={(e) => handleClick(e.features?.[0])}
		onmousemove={(e) => handleCircleHover('primary-places', e.features?.[0])}
		onmouseleave={onLeave}
	/>

	<SymbolMarkerLayer
		onMarkerClick={onFeatureClick}
		onMarkerHover={onEntryHover}
		onMarkerLeave={onLeave}
		minzoom={SYMBOL_MIN_ZOOM}
		{highlightedIds}
		{selectedKey}
		{opacity}
	/>
</GeoJSON>

{#if hoveredDepotId}
	<GeoJSON id="secondary-hovered-point-overlay" data={secondaryPlaces}>
		<CircleLayer
			id="secondary-hovered-point-overlay-layer"
			beforeId={BEFORE_ID}
			filter={['==', ['get', 'id'], hoveredDepotId]}
			paint={{
				'circle-color': theme.secondaryPlaceColor,
				'circle-radius': circleBaseRadius * 0.8,
				'circle-opacity': 1
			}}
			interactive={false}
			minzoom={SYMBOL_MIN_ZOOM}
		/>
	</GeoJSON>
{/if}

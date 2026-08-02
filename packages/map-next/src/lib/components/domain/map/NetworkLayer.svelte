<script lang="ts">
	import { GeoJSON, LineLayer, CircleLayer } from 'svelte-maplibre';
	import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
	import type { MainEntryFeature } from '$lib/types/entries';
	import type { MapDesignTokens } from '$lib/design/themes';

	// Move the network layers below the boundary state layer, so that they are nicely set in the background.
	const BEFORE_ID = 'boundary-state';

	interface NetworkLayerProps {
		/** The open farm or initiative whose network (and highlight) should be drawn. */
		entry: MainEntryFeature;
		/** Depot to emphasize (e.g. the one the user selected to reach this farm). */
		selectedDepotId?: string | null;
		theme: MapDesignTokens;
	}

	let { entry, selectedDepotId = null, theme }: NetworkLayerProps = $props();

	// Only farms have a depot network; initiatives just get the entry highlight below.
	const depots = $derived(
		entry.properties.type === 'Farm' ? (entry.properties.depots?.features ?? []) : []
	);

	// Only honour a selection that actually belongs to this farm's depots, so a
	// stale id left over from a previously opened farm is ignored.
	const effectiveSelectedId = $derived(
		selectedDepotId && depots.some((depot) => depot.properties.id === selectedDepotId)
			? selectedDepotId
			: null
	);

	const entryCoordinates = $derived(entry.geometry.coordinates);

	// One LineString per depot, farm → depot.
	const lineData = $derived<FeatureCollection<LineString>>({
		type: 'FeatureCollection',
		features: depots.map(
			(depot): Feature<LineString> => ({
				type: 'Feature',
				properties: {
					depotId: depot.properties.id,
					selected: depot.properties.id === effectiveSelectedId
				},
				geometry: {
					type: 'LineString',
					coordinates: [entryCoordinates, depot.geometry.coordinates]
				}
			})
		)
	});

	// Highlight rings around every involved depot marker.
	const highlightData = $derived<FeatureCollection<Point>>({
		type: 'FeatureCollection',
		features: depots.map(
			(depot): Feature<Point> => ({
				type: 'Feature',
				properties: {
					role: 'depot',
					selected: depot.properties.id === effectiveSelectedId
				},
				geometry: { type: 'Point', coordinates: depot.geometry.coordinates }
			})
		)
	});

	const entryCenterData = $derived<FeatureCollection<Point>>({
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				properties: { role: entry.properties.type.toLowerCase(), selected: false },
				geometry: { type: 'Point', coordinates: entryCoordinates }
			}
		]
	});
</script>

<GeoJSON id="farm-network-lines" data={lineData}>
	<LineLayer
		id="farm-network-line"
		beforeId={BEFORE_ID}
		layout={{ 'line-cap': 'round', 'line-join': 'round' }}
		paint={{
			'line-color': theme.networkLineColor,
			'line-width': [
				'case',
				['get', 'selected'],
				theme.networkLineWidth + 2,
				theme.networkLineWidth
			],
			'line-opacity': ['case', ['get', 'selected'], 0.95, 0.6]
		}}
		interactive={false}
	/>
</GeoJSON>

<GeoJSON id="farm-network-highlights" data={highlightData}>
	<CircleLayer
		id="farm-network-highlight"
		beforeId={BEFORE_ID}
		paint={{
			'circle-radius': ['case', ['get', 'selected'], 18, 13],
			'circle-color': theme.networkLineColor,
			'circle-opacity': 0.9,
			'circle-pitch-alignment': 'map'
		}}
		interactive={false}
	/>
</GeoJSON>

<GeoJSON id="farm-network-farm-highlight" data={entryCenterData}>
	<CircleLayer
		id="farm-network-farm-highlight"
		beforeId={BEFORE_ID}
		paint={{
			'circle-radius': 35,
			'circle-color': theme.networkLineColor,
			'circle-opacity': 0.9,
			'circle-pitch-alignment': 'map'
		}}
		interactive={false}
	/>
</GeoJSON>

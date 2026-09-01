<script lang="ts">
	import { GeoJSON, LineLayer, CircleLayer, Marker } from 'svelte-maplibre';
	import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
	import type { EntryFeature, MainEntryFeature } from '$lib/types/entries';
	import type { MapDesignTokens } from '$lib/design/themes';
	import EntryMarkerButton from './EntryMarkerButton.svelte';
	import { entryHoverKey } from '$lib/stores/hovered-entry.svelte';

	// Move the network layers below the boundary state layer, so that they are nicely set in the background.
	const BEFORE_ID = 'label-boundary-state';

	interface NetworkLayerProps {
		/** The open farm or initiative whose network (and highlight) should be drawn. */
		entry: MainEntryFeature;
		/** Depot to emphasize (e.g. the one the user selected to reach this farm). */
		selectedDepotId?: string | null;
		theme: MapDesignTokens;
		circleBaseRadius: number;
	}

	let { entry, selectedDepotId = null, theme, circleBaseRadius }: NetworkLayerProps = $props();

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

	const entryCoordinates = $derived<[number, number]>(
		entry.geometry.coordinates as [number, number]
	);
	const selectedEntryKey = $derived(entryHoverKey(entry.properties));

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
			'line-opacity': ['case', ['get', 'selected'], 0.9, 0.7]
		}}
		interactive={false}
	/>
</GeoJSON>

<GeoJSON id="farm-network-highlights" data={highlightData}>
	<CircleLayer
		id="farm-network-highlight"
		beforeId={BEFORE_ID}
		paint={{
			'circle-radius': [
				'case',
				['get', 'selected'],
				circleBaseRadius * 1.75,
				circleBaseRadius * 1.25
			],
			'circle-color': theme.networkLineColor,
			'circle-pitch-alignment': 'map'
		}}
		interactive={false}
	/>

	<CircleLayer
		id="farm-network-depot-fill"
		beforeId={BEFORE_ID}
		paint={{
			'circle-radius': [
				'case',
				['get', 'selected'],
				circleBaseRadius * 0.8,
				circleBaseRadius * 0.5
			],
			'circle-color': theme.secondaryPlaceColor,
			'circle-opacity': 0.95,
			'circle-pitch-alignment': 'map'
		}}
		interactive={false}
	/>
</GeoJSON>

<GeoJSON id="farm-network-farm-highlight" data={entryCenterData}>
	<Marker lngLat={entryCoordinates as [number, number]} interactive={false} zIndex={1}>
		<div class="marker-icon">
			<EntryMarkerButton
				entry={entry as EntryFeature}
				onClick={() => {}}
				isSelected={true}
				opacity={1}
			/>
		</div>
	</Marker>
</GeoJSON>

<style>
	.marker-icon {
		width: 60px;
		height: 60px;
		padding: 10px;
		border-radius: 50%;
		background: var(--map-network-line);
	}
</style>

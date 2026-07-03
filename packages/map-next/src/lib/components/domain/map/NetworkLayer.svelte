<script lang="ts">
	import { GeoJSON, LineLayer, CircleLayer } from 'svelte-maplibre';
	import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
	import type { FarmFeature } from '$lib/types/entries';
	import type { MapDesignTokens } from '$lib/design/themes';

	interface NetworkLayerProps {
		/** The open farm whose depot network should be drawn. */
		farm: FarmFeature;
		/** Depot to emphasize (e.g. the one the user selected to reach this farm). */
		selectedDepotId?: string | null;
		theme: MapDesignTokens;
	}

	let { farm, selectedDepotId = null, theme }: NetworkLayerProps = $props();

	const depots = $derived(farm.properties.depots?.features ?? []);

	// Only honour a selection that actually belongs to this farm's depots, so a
	// stale id left over from a previously opened farm is ignored.
	const effectiveSelectedId = $derived(
		selectedDepotId && depots.some((depot) => depot.properties.id === selectedDepotId)
			? selectedDepotId
			: null
	);

	const farmCoordinates = $derived(farm.geometry.coordinates);

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
					coordinates: [farmCoordinates, depot.geometry.coordinates]
				}
			})
		)
	});

	// Highlight rings around every involved marker (farm + each depot).
	const highlightData = $derived<FeatureCollection<Point>>({
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				properties: { role: 'farm', selected: false },
				geometry: { type: 'Point', coordinates: farmCoordinates }
			},
			...depots.map(
				(depot): Feature<Point> => ({
					type: 'Feature',
					properties: {
						role: 'depot',
						selected: depot.properties.id === effectiveSelectedId
					},
					geometry: { type: 'Point', coordinates: depot.geometry.coordinates }
				})
			)
		]
	});
</script>

{#if depots.length > 0}
	<GeoJSON id="farm-network-lines" data={lineData}>
		<LineLayer
			id="farm-network-line"
			beforeId="label-boundary-state"
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
			beforeId="label-boundary-state"
			paint={{
				'circle-radius': ['case', ['get', 'selected'], 18, 13],
				'circle-color': theme.networkLineColor,
				'circle-opacity': ['case', ['get', 'selected'], 0.22, 0.12],
				'circle-stroke-color': theme.networkLineColor,
				'circle-stroke-width': ['case', ['get', 'selected'], 3, 2],
				'circle-stroke-opacity': ['case', ['get', 'selected'], 0.95, 0.7]
			}}
			interactive={false}
		/>
	</GeoJSON>
{/if}

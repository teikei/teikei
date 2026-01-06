<script lang="ts">
	import { MapLibre, NavigationControl, GeolocateControl } from 'svelte-maplibre';
	import { getMapStyle } from './map-style';
	import { dynamicClusterLayer, unclusteredPointLayer } from './layers';
	import config from '$lib/config/app-configuration';
	import type { FeatureCollection, Feature } from 'geojson';
	import type { Map, GeoJSONSource } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { UserNavigation } from '$lib/components/shared';

	interface MapProps {
		entries?: FeatureCollection;
	}

	let { entries }: MapProps = $props();

	const { countries, country, zoom } = config;
	const { center, zoom: defaultZoom } = countries[country as keyof typeof countries];

	const mapStyle = getMapStyle();

	// only show Farms and Initiatives
	const filteredEntries = $derived(
		entries
			? {
					...entries,
					features: entries.features.filter(
						(feature: Feature) =>
							feature.properties?.type === 'Farm' || feature.properties?.type === 'Initiative'
					)
				}
			: {
					type: 'FeatureCollection' as const,
					features: []
				}
	);

	let map: Map | undefined = $state();

	function handleLoad(loadedMap: Map) {
		map = loadedMap;
		addSourceAndLayers();
	}

	function addSourceAndLayers() {
		if (!map) return;

		const sourceId = 'entries';

		// Add source if it doesn't exist
		if (!map.getSource(sourceId)) {
			map.addSource(sourceId, {
				type: 'geojson',
				data: filteredEntries,
				cluster: true,
				clusterRadius: 20
			});
		} else {
			// Update source data
			const source = map.getSource(sourceId) as GeoJSONSource;
			if (source && source.type === 'geojson') {
				source.setData(filteredEntries);
			}
		}

		// Add cluster layer if it doesn't exist
		if (!map.getLayer(dynamicClusterLayer.id)) {
			map.addLayer(dynamicClusterLayer);
		}

		// Add unclustered point layer if it doesn't exist
		if (!map.getLayer(unclusteredPointLayer.id)) {
			map.addLayer(unclusteredPointLayer);
		}
	}

	// Update source data when entries change
	$effect(() => {
		if (map && filteredEntries.features.length > 0) {
			const source = map.getSource('entries') as GeoJSONSource;
			if (source && source.type === 'geojson') {
				source.setData(filteredEntries);
			}
		}
	});
</script>

<div class="map-container">
	<UserNavigation />
	<MapLibre
		style={mapStyle}
		center={[center[1], center[0]]}
		zoom={defaultZoom}
		minZoom={zoom.min}
		maxZoom={zoom.max}
		class="map"
		onload={handleLoad}
	>
		<NavigationControl position="bottom-right" />
		<GeolocateControl position="bottom-right" />
	</MapLibre>
</div>

<style>
	.map-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	:global(.map) {
		width: 100%;
		height: 100%;
	}
</style>

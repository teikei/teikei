<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		GeolocateControl,
		GeoJSON,
		CircleLayer,
		Popup
	} from 'svelte-maplibre';
	import { getMapStyle } from './map-style';
	import { clusterPaint, unclusteredPointPaint } from './layers';
	import config from '$lib/config/app-configuration';
	import type { FeatureCollection, Feature } from 'geojson';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { UserNavigation } from '$lib/components/shared';
	import MapSidebar from './MapSidebar.svelte';

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
</script>

<div class="map-container">
	<UserNavigation />
	<MapSidebar entries={filteredEntries} />
	<MapLibre
		style={mapStyle}
		center={[center[1], center[0]]}
		zoom={defaultZoom}
		minZoom={zoom.min}
		maxZoom={zoom.max}
		class="map"
	>
		<NavigationControl position="bottom-right" />
		<GeolocateControl position="bottom-right" />

		<GeoJSON id="entries" data={filteredEntries} cluster={{ radius: 20 }}>
			<CircleLayer
				id="clusters"
				filter={['has', 'point_count']}
				paint={clusterPaint}
				applyToClusters
			/>
			<CircleLayer
				id="unclustered-point"
				filter={['!', ['has', 'point_count']]}
				paint={unclusteredPointPaint}
				hoverCursor="pointer"
			>
				<Popup openOn="hover" offset={[0, -5]}>
					{#snippet children({ data })}
						{#if data?.properties?.name}
							<div class="entry-popup">
								<strong>{data.properties.name}</strong>
							</div>
						{/if}
					{/snippet}
				</Popup>
			</CircleLayer>
		</GeoJSON>
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

	.entry-popup {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}
</style>

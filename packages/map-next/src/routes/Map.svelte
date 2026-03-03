<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		GeolocateControl,
		GeoJSON,
		CircleLayer
	} from 'svelte-maplibre';
	import type { Map as MaplibreMap, LngLatLike } from 'maplibre-gl';
	import { getMapStyle } from './map-style';
	import config from '$lib/config/app-configuration';
	import type { FeatureCollection, Feature, Point } from 'geojson';
	import type { EntryProperties, EntryFeature } from '$lib/types/entries';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import UserNavigation from '$lib/components/app/UserNavigation.svelte';
	import MapSidebar from './MapSidebar.svelte';
	import SymbolMarkerLayer from '$lib/map/SymbolMarkerLayer.svelte';
	import Popup from '$lib/components/map/Popup.svelte';
	import { dev } from '$app/environment';

	interface MapProps {
		entries?: FeatureCollection;
	}

	let { entries }: MapProps = $props();

	const { countries, country, zoom } = config;
	const { center, zoom: initialZoom } = countries[country as keyof typeof countries];

	const mapStyle = getMapStyle();

	// Map instance reference
	let map: MaplibreMap | undefined = $state();

	// Sidebar reference for calling openDetailView
	let sidebarComponent: MapSidebar | undefined = $state();

	// Selected entry state for programmatic popup
	let selectedEntry: {
		feature: Feature<Point, EntryProperties>;
		options?: { offset?: [number, number] };
	} | null = $state(null);
	let isPopupOpen = $state(false);
	let currentZoom: number | undefined = $state(initialZoom);

	function handleEntryClick(
		feature: Feature<Point, EntryProperties>,
		options?: { offset?: [number, number] }
	) {
		const [lng, lat] = feature.geometry.coordinates;

		selectedEntry = { feature, options };

		// Pan the map to center the entry in the visible area to the right of the sidebar
		if (map) {
			const sidebarWidth = 500; // matches the w-[500px] class on Sidebar.Root
			map.flyTo({
				center: [lng, lat],
				zoom: Math.max(map.getZoom(), 10),
				offset: [sidebarWidth / 2, 0],
				duration: 1000
			});
		}
	}

	function handleDetailClose() {
		// Close the map popup when the detail view is closed
		isPopupOpen = false;
		selectedEntry = null;
	}

	function handleMapEntryClick(
		feature: Feature<Point, EntryProperties>,
		options?: { offset?: [number, number] }
	) {
		if (!feature) return;

		// Pan map and show popup
		handleEntryClick(feature, options);

		if (feature.properties.cluster) {
			handleDetailClose();
		} else {
			// Open detail view in sidebar
			sidebarComponent?.openDetailView(feature);

			// Open the popup after a short delay to let the map start moving
			setTimeout(() => {
				isPopupOpen = true;
			}, 100);
		}
	}

	// only show Farms and Initiatives
	const primaryPlaces = $derived(
		entries
			? {
					...entries,
					features:
						(currentZoom ?? initialZoom) <= 10.5
							? entries.features.filter(
									(feature: Feature) =>
										feature.properties?.type === 'Farm' || feature.properties?.type === 'Initiative'
								)
							: entries.features
				}
			: {
					type: 'FeatureCollection' as const,
					features: []
				}
	);

	const secondaryPlaces = $derived(
		entries
			? {
					...entries,
					features: entries.features.filter(
						(feature: Feature) => feature.properties?.type === 'Depot'
					)
				}
			: {
					type: 'FeatureCollection' as const,
					features: []
				}
	);

	const circleBaseRadius = $derived((currentZoom || initialZoom) * 0.75);
</script>

<div class="map-container">
	<UserNavigation />
	<MapSidebar
		bind:this={sidebarComponent}
		entries={primaryPlaces}
		onDetailClose={handleDetailClose}
	/>
	<MapLibre
		bind:map
		class="map"
		style={mapStyle}
		center={[center[1], center[0]]}
		{initialZoom}
		minZoom={zoom.min}
		maxZoom={zoom.max}
		onzoom={() => {
			currentZoom = map?.getZoom();
		}}
	>
		<NavigationControl position="bottom-right" />
		<GeolocateControl position="bottom-right" />

		<GeoJSON
			id="secondary-places"
			data={secondaryPlaces}
			cluster={{ radius: circleBaseRadius - 3 }}
		>
			<CircleLayer
				id="secondary-points"
				beforeId="label-boundary-state"
				paint={{
					'circle-color': '#FFC8AF',
					'circle-radius': circleBaseRadius - 3,
					'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 9, 1]
				}}
				hoverCursor="pointer"
				minzoom={7}
				maxzoom={10.5}
				onclick={(e) => handleMapEntryClick(e.features?.[0])}
			></CircleLayer>
		</GeoJSON>

		<GeoJSON id="primary-places" data={primaryPlaces} cluster={{ radius: 3 + circleBaseRadius }}>
			<CircleLayer
				id="primary-clusters"
				beforeId="label-boundary-state"
				filter={['has', 'point_count']}
				paint={{
					'circle-color': '#FFA08C',
					'circle-radius': 3 + circleBaseRadius
				}}
				hoverCursor="pointer"
				applyToClusters
				maxzoom={10.5}
				onclick={(e) => handleMapEntryClick(e.features?.[0])}
			/>
			<CircleLayer
				id="primary-points"
				beforeId="label-boundary-state"
				filter={['!', ['has', 'point_count']]}
				paint={{
					'circle-color': '#FFC8AF',
					'circle-radius': circleBaseRadius
				}}
				hoverCursor="pointer"
				maxzoom={10.5}
				onclick={(e) => handleMapEntryClick(e.features?.[0])}
			></CircleLayer>

			<SymbolMarkerLayer
				onMarkerClick={handleMapEntryClick}
				entries={primaryPlaces}
				minzoom={10.5}
			/>
		</GeoJSON>

		<!-- Programmatic popup for selected entry from sidebar -->
		{#if selectedEntry}
			<Popup bind:isPopupOpen bind:selectedEntry onclose={handleDetailClose} />
		{/if}
	</MapLibre>

	{#if dev && currentZoom !== undefined}
		<div class="zoom-indicator">
			Zoom: {currentZoom.toFixed(2)}
		</div>
	{/if}
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

	.zoom-indicator {
		position: absolute;
		bottom: 3.5rem;
		right: 3.5rem;
		background: black;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		font-family: monospace;
		z-index: 10;
	}
</style>

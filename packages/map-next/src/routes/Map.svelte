<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		GeolocateControl,
		GeoJSON,
		CircleLayer
	} from 'svelte-maplibre';
	import type { Map as MaplibreMap } from 'maplibre-gl';
	import { getMapStyle } from './map-style';
	import config from '$lib/config/app-configuration';
	import type { EntryFeature, EntryFeatureCollection } from '$lib/types/entries';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import UserNavigation from '$lib/components/app/UserNavigation.svelte';
	import MapSidebar from './MapSidebar.svelte';
	import SymbolMarkerLayer from '$lib/map/SymbolMarkerLayer.svelte';
	import Popup from '$lib/components/map/Popup.svelte';
	import { buildEntryFlyToOptions } from '$lib/utils/map-focus';
	import { createDebouncedCallback } from '$lib/utils/debounce';
	import { filterSidebarEntriesByViewport } from '$lib/utils/entries-viewport';
	import { dev } from '$app/environment';

	interface MapProps {
		entries?: EntryFeatureCollection;
	}

	interface EntryFocusOptions {
		offset?: [number, number];
		openPopup?: boolean;
	}

	const BBOX_SYNC_DEBOUNCE_MS = 100;

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
		feature: EntryFeature;
		options?: EntryFocusOptions;
	} | null = $state(null);
	let isPopupOpen = $state(false);
	let currentZoom: number | undefined = $state(initialZoom);
	let pendingFocus: {
		feature: EntryFeature;
		options?: EntryFocusOptions;
	} | null = $state(null);
	let isSidebarUpdating = $state(false);
	let sidebarEntries: EntryFeatureCollection = $state({
		type: 'FeatureCollection',
		features: []
	});

	function applyFocusToMap(feature: EntryFeature, options?: EntryFocusOptions) {
		if (!map) return;
		map.flyTo(buildEntryFlyToOptions(feature, map.getZoom(), { offset: options?.offset }));
	}

	function focusEntry(feature: EntryFeature, options?: EntryFocusOptions) {
		selectedEntry = { feature, options };
		if (options?.openPopup) {
			isPopupOpen = true;
		}

		if (!map) {
			pendingFocus = { feature, options };
			return;
		}

		pendingFocus = null;
		applyFocusToMap(feature, options);
	}

	function handleDetailClose() {
		// Close the map popup when the detail view is closed
		isPopupOpen = false;
		selectedEntry = null;
		pendingFocus = null;
	}

	function handleMapEntryClick(
		feature: EntryFeature | undefined,
		options?: { offset?: [number, number] }
	) {
		if (!feature) return;

		// Pan map and show popup
		focusEntry(feature, options);

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

	function syncSidebarEntriesToViewport() {
		if (!map) {
			sidebarEntries = filterSidebarEntriesByViewport(mapEntries);
			isSidebarUpdating = false;
			return;
		}

		const bounds = map.getBounds();
		sidebarEntries = filterSidebarEntriesByViewport(mapEntries, (coordinate) =>
			bounds.contains(coordinate)
		);
		isSidebarUpdating = false;
	}

	const debouncedSidebarSync = createDebouncedCallback(
		() => syncSidebarEntriesToViewport(),
		BBOX_SYNC_DEBOUNCE_MS
	);

	$effect(() => {
		if (!map || !pendingFocus) return;
		const pending = pendingFocus;
		pendingFocus = null;
		applyFocusToMap(pending.feature, pending.options);
	});

	$effect(() => {
		mapEntries;
		map;
		syncSidebarEntriesToViewport();
	});

	$effect(() => {
		if (!map) return;

		const startSync = () => {
			isSidebarUpdating = true;
		};
		const scheduleSync = () => {
			isSidebarUpdating = true;
			debouncedSidebarSync.trigger();
		};

		map.on('movestart', startSync);
		map.on('zoomstart', startSync);
		map.on('moveend', scheduleSync);
		map.on('zoomend', scheduleSync);

		return () => {
			map.off('movestart', startSync);
			map.off('zoomstart', startSync);
			map.off('moveend', scheduleSync);
			map.off('zoomend', scheduleSync);
			debouncedSidebarSync.cancel();
		};
	});

	const mapEntries = $derived(
		entries ?? {
			type: 'FeatureCollection' as const,
			features: []
		}
	);

	const circleZoomAdjustment = $derived((currentZoom || initialZoom) * 0.7);
</script>

<div class="map-container">
	<UserNavigation />
	<MapSidebar
		bind:this={sidebarComponent}
		entries={sidebarEntries}
		isUpdating={isSidebarUpdating}
		onEntryClick={focusEntry}
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

		<GeoJSON id="entries" data={mapEntries} cluster={{ radius: 5 + circleZoomAdjustment }}>
			<CircleLayer
				id="clusters"
				beforeId="label-boundary-state"
				filter={['has', 'point_count']}
				paint={{
					'circle-color': '#FFA08C',
					'circle-radius': 5 + circleZoomAdjustment
				}}
				hoverCursor="pointer"
				applyToClusters
				maxzoom={9.5}
				onclick={(e) => handleMapEntryClick(e.features?.[0] as EntryFeature | undefined)}
			/>
			<CircleLayer
				id="unclustered-point"
				beforeId="label-boundary-state"
				filter={['!', ['has', 'point_count']]}
				paint={{
					'circle-color': '#FFC8AF',
					'circle-radius': 1 + circleZoomAdjustment
				}}
				hoverCursor="pointer"
				maxzoom={9.5}
				onclick={(e) => handleMapEntryClick(e.features?.[0] as EntryFeature | undefined)}
			></CircleLayer>

			<SymbolMarkerLayer onMarkerClick={handleMapEntryClick} entries={mapEntries} minzoom={9.5} />
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

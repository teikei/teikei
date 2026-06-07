<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		GeolocateControl,
		GeoJSON,
		CircleLayer
	} from 'svelte-maplibre';
	import { type Map as MaplibreMap } from 'maplibre-gl';
	import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getMapStyle } from './map-style';
	import config from '$lib/config/app-configuration';
	import { readMapDesignTokens, type MapDesignTokens } from '$lib/design/themes';
	import type { EntryFeature, EntryFeatureCollection } from '$lib/types/entries';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { AccountTokenHandler, UserNavigation } from '$lib/components/layout';
	import MapSidebar from './MapSidebar.svelte';
	import { Popup, SymbolMarkerLayer } from '$lib/components/domain/map';
	import { MAP_SIDEBAR_WIDTH_PX } from '$lib/config/layout';
	import { asEntryFeature } from '$lib/utils/entry-features';
	import { buildEntryFlyToOptions, buildFlyToOptions } from '$lib/utils/map-focus';
	import { createDebouncedCallback } from '$lib/utils/debounce';
	import { filterSidebarEntriesByViewport } from '$lib/utils/entries-viewport';
	import { getRegionBounds, getRegionOptionsForCountry } from '$lib/utils/regions';
	import { isInternalDesignRouteHash } from '$lib/utils/routes';
	import { createMyEntriesStore } from '$lib/stores/my-entries.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { dev } from '$app/environment';

	interface MapProps {
		entries?: EntryFeatureCollection;
	}

	interface EntryFocusOptions {
		offset?: [number, number];
		openPopup?: boolean;
	}

	interface DiscoveryFocus {
		kind: 'location' | 'position';
		latitude: number;
		longitude: number;
		id?: string;
		coords?: string;
	}

	const BBOX_SYNC_DEBOUNCE_MS = 100;
	const FOCUS_DURATION_MS = 1000;
	const REGION_FOCUS_PADDING_PX = 64;
	const EMPTY_ENTRIES: EntryFeatureCollection = {
		type: 'FeatureCollection',
		features: []
	};

	let { entries }: MapProps = $props();

	const mapEntries = $derived(entries ?? EMPTY_ENTRIES);

	const { countries, country, zoom } = config;
	const { center, zoom: initialZoom } = countries[country as keyof typeof countries];
	let mapRoot: HTMLElement | undefined = $state();
	let mapTheme: MapDesignTokens | undefined = $state();
	let mapStyle: ReturnType<typeof getMapStyle> | undefined = $state();

	onMount(() => {
		if (!mapRoot) {
			return;
		}

		const theme = readMapDesignTokens(mapRoot);
		mapTheme = theme;
		mapStyle = getMapStyle({ theme });
	});

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
	let selectedCountry = $state(country);
	let selectedState: string | null = $state(null);
	let pendingFocus: {
		feature: EntryFeature;
		options?: EntryFocusOptions;
	} | null = $state(null);
	let pendingDiscoveryFocus: DiscoveryFocus | null = $state(null);
	let lastDiscoveryFocusKey: string | null = $state(null);
	let sidebarEntries: EntryFeatureCollection = $state(EMPTY_ENTRIES);
	const discoveryFocus = $derived(page.data.discoveryFocus as DiscoveryFocus | undefined);
	const myEntriesStore = createMyEntriesStore();

	const countryLabels: Record<string, () => string> = {
		DE: m.map_country_de,
		CH: m.map_country_ch,
		AT: m.map_country_at
	};

	function getCountryLabel(countryCode: string): string {
		return countryLabels[countryCode]?.() ?? countryCode;
	}

	function buildAttributionLink(href: string, label: string): string {
		return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
	}

	const countryOptions = $derived(
		Object.keys(countries).map((countryCode) => ({
			value: countryCode,
			label: getCountryLabel(countryCode)
		}))
	);

	const stateOptions = $derived(getRegionOptionsForCountry(selectedCountry));
	const mapControlsPosition = 'top-right' as const;
	const attributionControlOptions = $derived({
		compact: true,
		customAttribution: [
			buildAttributionLink(config.siteUrl, m.footer_site_title()),
			buildAttributionLink(config.imprintUrl, m.footer_imprint()),
			buildAttributionLink(config.privacyUrl, m.footer_privacy()),
			`${m.footer_map_data()} ${buildAttributionLink(config.mapboxAboutUrl, m.footer_mapbox())}`
		].join(' | ')
	});

	function applyFocusToMap(feature: EntryFeature, options?: EntryFocusOptions) {
		if (!map) return;
		map.flyTo(buildEntryFlyToOptions(feature, map.getZoom(), { offset: options?.offset }));
	}

	function applyDiscoveryFocusToMap(focus: DiscoveryFocus) {
		if (!map) {
			pendingDiscoveryFocus = focus;
			return;
		}

		selectedEntry = null;
		isPopupOpen = false;
		pendingFocus = null;
		pendingDiscoveryFocus = null;

		map.flyTo({
			center: [focus.longitude, focus.latitude],
			zoom: zoom.searchResult,
			offset: [MAP_SIDEBAR_WIDTH_PX / 2, 0],
			duration: FOCUS_DURATION_MS
		});
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

	function focusCountry(countryCode: string) {
		if (!map) return;
		const countryConfig = countries[countryCode as keyof typeof countries];
		if (!countryConfig) return;
		const [countryLat, countryLng] = countryConfig.center;
		map.flyTo({
			center: [countryLng, countryLat],
			zoom: countryConfig.zoom,
			offset: [MAP_SIDEBAR_WIDTH_PX / 2, 0],
			duration: FOCUS_DURATION_MS
		});
	}

	function focusState(countryCode: string, stateCode: string) {
		if (!map) return;

		const regionBounds = getRegionBounds(countryCode, stateCode);
		if (!regionBounds) {
			if (dev) {
				console.warn(`No region bounds found for ${countryCode}-${stateCode}`);
			}
			return;
		}

		map.fitBounds(regionBounds, {
			padding: {
				top: REGION_FOCUS_PADDING_PX,
				right: REGION_FOCUS_PADDING_PX,
				bottom: REGION_FOCUS_PADDING_PX,
				left: REGION_FOCUS_PADDING_PX + MAP_SIDEBAR_WIDTH_PX
			},
			maxZoom: zoom.searchResult,
			duration: FOCUS_DURATION_MS
		});
	}

	function handleCountryChange(countryCode: string) {
		if (countryCode === selectedCountry) return;
		selectedCountry = countryCode;
		selectedState = null;
		focusCountry(countryCode);
	}

	function handleStateChange(stateCode: string | null) {
		if (stateCode === selectedState) return;
		selectedState = stateCode;
		if (!stateCode) {
			focusCountry(selectedCountry);
			return;
		}
		focusState(selectedCountry, stateCode);
	}

	function handleDetailClose() {
		// Close the map popup when the detail view is closed
		isPopupOpen = false;
		selectedEntry = null;
		pendingFocus = null;
	}

	function handleMapEntryClick(
		feature: Feature<Geometry, GeoJsonProperties> | EntryFeature | undefined,
		options?: { offset?: [number, number] }
	) {
		if (!feature) return;

		const entry = asEntryFeature(feature);
		if (!entry) {
			// Cluster (or other non-entry) feature: fly toward it, but show no detail view.
			if (map && feature.geometry.type === 'Point') {
				map.flyTo(buildFlyToOptions(feature.geometry.coordinates, map.getZoom(), options));
			}
			handleDetailClose();
			return;
		}

		// Pan map and show popup
		focusEntry(entry, options);

		// Open detail view in sidebar
		sidebarComponent?.openDetailView(entry);

		// Open the popup after a short delay to let the map start moving
		setTimeout(() => {
			isPopupOpen = true;
		}, 100);
	}

	function syncSidebarEntriesToViewport() {
		if (!map) {
			sidebarEntries = filterSidebarEntriesByViewport(mapEntries);
			return;
		}

		const bounds = map.getBounds();
		sidebarEntries = filterSidebarEntriesByViewport(mapEntries, (coordinate) =>
			bounds.contains(coordinate)
		);
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
		if (!map || !pendingDiscoveryFocus) return;
		const pending = pendingDiscoveryFocus;
		pendingDiscoveryFocus = null;
		applyDiscoveryFocusToMap(pending);
	});

	$effect(() => {
		if (!discoveryFocus) {
			lastDiscoveryFocusKey = null;
			return;
		}

		const key = `${discoveryFocus.kind}:${discoveryFocus.latitude}:${discoveryFocus.longitude}:${discoveryFocus.id ?? discoveryFocus.coords ?? ''}`;
		if (key === lastDiscoveryFocusKey) {
			return;
		}

		lastDiscoveryFocusKey = key;
		applyDiscoveryFocusToMap(discoveryFocus);
	});

	$effect(() => {
		// Re-syncs when `mapEntries` or `map` change: both are read reactively
		// inside the call, so Svelte tracks them automatically.
		syncSidebarEntriesToViewport();
	});

	$effect(() => {
		if (!map) return;
		const mapInstance = map;

		const scheduleSync = () => {
			debouncedSidebarSync.trigger();
		};

		mapInstance.on('moveend', scheduleSync);
		mapInstance.on('zoomend', scheduleSync);

		return () => {
			mapInstance.off('moveend', scheduleSync);
			mapInstance.off('zoomend', scheduleSync);
			debouncedSidebarSync.cancel();
		};
	});

	// only show Farms and Initiatives
	const primaryPlaces = $derived({
		...mapEntries,
		features: mapEntries.features.filter(
			(feature) => feature.properties?.type === 'Farm' || feature.properties?.type === 'Initiative'
		)
	});

	const secondaryPlaces = $derived({
		...mapEntries,
		features: mapEntries.features.filter((feature) => feature.properties?.type === 'Depot')
	});

	const circleBaseRadius = $derived((currentZoom ?? initialZoom) * 0.75);
	const showSidebar = $derived(!isInternalDesignRouteHash(page.url.hash));
</script>

<div class="map-container" bind:this={mapRoot}>
	<UserNavigation />
	<AccountTokenHandler />
	{#if showSidebar}
		<MapSidebar
			bind:this={sidebarComponent}
			entries={sidebarEntries}
			myEntries={myEntriesStore.entries}
			isMyEntriesLoading={myEntriesStore.isLoading}
			onEntryClick={focusEntry}
			onDetailClose={handleDetailClose}
			{countryOptions}
			{stateOptions}
			{selectedCountry}
			{selectedState}
			onCountryChange={handleCountryChange}
			onStateChange={handleStateChange}
		/>
	{/if}
	{#if mapStyle && mapTheme}
		<MapLibre
			bind:map
			class="map"
			style={mapStyle}
			center={[center[1], center[0]]}
			{initialZoom}
			minZoom={zoom.min}
			maxZoom={zoom.max}
			attributionControl={attributionControlOptions}
			onzoom={() => {
				currentZoom = map?.getZoom();
			}}
		>
			<NavigationControl position={mapControlsPosition} />
			<GeolocateControl position={mapControlsPosition} />

			<GeoJSON
				id="secondary-places"
				data={secondaryPlaces}
				cluster={{ radius: circleBaseRadius - 4 }}
			>
				<CircleLayer
					id="secondary-points"
					beforeId="label-boundary-state"
					paint={{
						'circle-color': mapTheme.secondaryPlaceColor,
						'circle-radius': circleBaseRadius - 4,
						'circle-opacity': ['interpolate', ['linear'], ['zoom'], zoom.min, 0.75, 9, 0.9]
					}}
					hoverCursor="pointer"
					minzoom={zoom.min}
					onclick={(e) => handleMapEntryClick(e.features?.[0])}
				></CircleLayer>
			</GeoJSON>

			<GeoJSON id="primary-places" data={primaryPlaces} cluster={{ radius: 3 + circleBaseRadius }}>
				<CircleLayer
					id="primary-clusters"
					beforeId="label-boundary-state"
					filter={['has', 'point_count']}
					paint={{
						'circle-color': mapTheme.primaryClusterColor,
						'circle-radius': 3 + circleBaseRadius
					}}
					hoverCursor="pointer"
					applyToClusters
					maxzoom={9.5}
					onclick={(e) => handleMapEntryClick(e.features?.[0] as EntryFeature | undefined)}
				/>
				<CircleLayer
					id="primary-points"
					beforeId="label-boundary-state"
					filter={['!', ['has', 'point_count']]}
					paint={{
						'circle-color': mapTheme.primaryPlaceColor,
						'circle-radius': circleBaseRadius
					}}
					hoverCursor="pointer"
					maxzoom={9.5}
					onclick={(e) => handleMapEntryClick(e.features?.[0] as EntryFeature | undefined)}
				></CircleLayer>

				<SymbolMarkerLayer onMarkerClick={handleMapEntryClick} minzoom={9.5} />
			</GeoJSON>

			<!-- Programmatic popup for selected entry from sidebar -->
			{#if selectedEntry}
				<Popup bind:isPopupOpen bind:selectedEntry onclose={handleDetailClose} />
			{/if}
		</MapLibre>
	{/if}

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

	:global(.maplibregl-ctrl-top-right) {
		top: 3.75rem;
		right: 0.11rem;
	}
</style>

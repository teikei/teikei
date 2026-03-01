<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		GeolocateControl,
		GeoJSON,
		CircleLayer
	} from 'svelte-maplibre';
	import { type Map as MaplibreMap } from 'maplibre-gl';
	import { page } from '$app/state';
	import { getMapStyle } from './map-style';
	import config from '$lib/config/app-configuration';
	import type { EntryFeature, EntryFeatureCollection } from '$lib/types/entries';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import UserNavigation from '$lib/components/app/UserNavigation.svelte';
	import MapSidebar from './MapSidebar.svelte';
	import SymbolMarkerLayer from '$lib/components/map/SymbolMarkerLayer.svelte';
	import Popup from '$lib/components/map/Popup.svelte';
	import { getMyEntries } from '$lib/api/entries';
	import { MAP_SIDEBAR_WIDTH_PX } from '$lib/config/layout';
	import { buildEntryFlyToOptions } from '$lib/utils/map-focus';
	import { createDebouncedCallback } from '$lib/utils/debounce';
	import { filterSidebarEntriesByViewport } from '$lib/utils/entries-viewport';
	import { getRegionBounds, getRegionOptionsForCountry } from '$lib/utils/regions';
	import { getCurrentUser, isInitialized } from '$lib/stores/auth.svelte';
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
	let selectedCountry = $state(country);
	let selectedState: string | null = $state(null);
	let pendingFocus: {
		feature: EntryFeature;
		options?: EntryFocusOptions;
	} | null = $state(null);
	let pendingDiscoveryFocus: DiscoveryFocus | null = $state(null);
	let lastDiscoveryFocusKey: string | null = $state(null);
	let myEntriesRequestId = 0;
	let isMyEntriesLoading = $state(false);
	let myEntries: EntryFeatureCollection = $state(EMPTY_ENTRIES);
	let sidebarEntries: EntryFeatureCollection = $state(EMPTY_ENTRIES);
	const discoveryFocus = $derived(page.data.discoveryFocus as DiscoveryFocus | undefined);

	function sortOwnedEntries(ownedEntries: EntryFeatureCollection): EntryFeatureCollection {
		return {
			...ownedEntries,
			features: [...ownedEntries.features].sort((a, b) => {
				const aUpdatedAt = Date.parse(a.properties.updatedAt ?? '');
				const bUpdatedAt = Date.parse(b.properties.updatedAt ?? '');
				if (!Number.isFinite(aUpdatedAt) && !Number.isFinite(bUpdatedAt)) {
					return 0;
				}
				if (!Number.isFinite(aUpdatedAt)) {
					return 1;
				}
				if (!Number.isFinite(bUpdatedAt)) {
					return -1;
				}
				return bUpdatedAt - aUpdatedAt;
			})
		};
	}

	async function refreshMyEntries(): Promise<void> {
		const initialized = isInitialized();
		const currentUser = getCurrentUser();
		if (!initialized || !currentUser) {
			myEntriesRequestId += 1;
			isMyEntriesLoading = false;
			myEntries = EMPTY_ENTRIES;
			return;
		}

		const requestId = ++myEntriesRequestId;
		isMyEntriesLoading = true;
		try {
			const ownedEntries = await getMyEntries();
			if (requestId !== myEntriesRequestId) {
				return;
			}
			myEntries = sortOwnedEntries(ownedEntries);
		} catch (error) {
			if (requestId !== myEntriesRequestId) {
				return;
			}
			myEntries = EMPTY_ENTRIES;
			if (dev) {
				console.warn('Failed to fetch my entries', error);
			}
		} finally {
			if (requestId === myEntriesRequestId) {
				isMyEntriesLoading = false;
			}
		}
	}

	function getCountryLabel(countryCode: string): string {
		if (countryCode === 'DE') {
			return m.map_country_de();
		}
		if (countryCode === 'CH') {
			return m.map_country_ch();
		}
		if (countryCode === 'AT') {
			return m.map_country_at();
		}
		return countryCode;
	}

	const countryOptions = $derived(
		Object.keys(countries).map((countryCode) => ({
			value: countryCode,
			label: getCountryLabel(countryCode)
		}))
	);

	const stateOptions = $derived(getRegionOptionsForCountry(selectedCountry));

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
		mapEntries;
		map;
		syncSidebarEntriesToViewport();
	});

	$effect(() => {
		// Refresh owned entries on auth and route transitions.
		isInitialized();
		getCurrentUser();
		page.url.hash;
		void refreshMyEntries();
	});

	$effect(() => {
		if (!map) return;

		const startSync = () => {};
		const scheduleSync = () => {
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

	// only show Farms and Initiatives
	const primaryPlaces = $derived(
		entries
			? {
					...entries,
					features: entries.features.filter(
						(feature) =>
							feature.properties?.type === 'Farm' || feature.properties?.type === 'Initiative'
					)
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
		{myEntries}
		{isMyEntriesLoading}
		onEntryClick={focusEntry}
		onDetailClose={handleDetailClose}
		{countryOptions}
		{stateOptions}
		{selectedCountry}
		{selectedState}
		onCountryChange={handleCountryChange}
		onStateChange={handleStateChange}
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
			cluster={{ radius: circleBaseRadius - 4 }}
		>
			<CircleLayer
				id="secondary-points"
				beforeId="label-boundary-state"
				paint={{
					'circle-color': '#FFC8AF',
					'circle-radius': circleBaseRadius - 4,
					'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 9, 0.9]
				}}
				hoverCursor="pointer"
				minzoom={7}
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
				maxzoom={9.5}
				onclick={(e) => handleMapEntryClick(e.features?.[0] as EntryFeature | undefined)}
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
				maxzoom={9.5}
				onclick={(e) => handleMapEntryClick(e.features?.[0] as EntryFeature | undefined)}
			></CircleLayer>

			<SymbolMarkerLayer
				onMarkerClick={handleMapEntryClick}
				entries={primaryPlaces}
				minzoom={9.5}
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

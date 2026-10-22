<script lang="ts">
	import { MapLibre, NavigationControl, GeolocateControl } from 'svelte-maplibre';
	import { LngLatBounds, type Map as MaplibreMap } from 'maplibre-gl';
	import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { getMapStyle } from '$lib/design/map-style';
	import config from '$lib/config/app-configuration';
	import { readMapDesignTokens, type MapDesignTokens } from '$lib/design/themes';
	import type { EntryFeature, EntryFeatureCollection, MainEntryFeature } from '$lib/types/entries';
	import type { DiscoveryFocus } from '$lib/types/discovery';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import '$lib/design/map-controls.css';
	import { AccountTokenHandler, UserNavigation } from '$lib/components/domain/auth';
	import MapSidebar from './MapSidebar.svelte';
	import { EntryLayers, NetworkLayer, Popup } from '$lib/components/domain/map';
	import { networkSelection } from '$lib/stores/network-selection.svelte';
	import { entryHoverKey } from '$lib/stores/hovered-entry.svelte';
	import { MAP_SIDEBAR_WIDTH_PX, MAP_EDITOR_WIDTH_PX } from '$lib/config/layout';
	import { asEntryFeature, isFarmWithDepots } from '$lib/utils/entry-features';
	import {
		buildEntryFlyToOptions,
		buildFlyToOptions,
		getSidebarFitPadding,
		getSidebarFocusOffset
	} from '$lib/utils/map-focus';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { createDebouncedCallback } from '$lib/utils/debounce';
	import { filterSidebarEntriesByViewport } from '$lib/utils/entries-viewport';
	import {
		getCountryOptions,
		getRegionBounds,
		getRegionOptionsForCountry
	} from '$lib/utils/regions';
	import { isSearchShortcut } from '$lib/utils/keyboard';
	import { buildMapAttribution } from '$lib/utils/map-attribution';
	import { isInternalDesignRouteHash } from '$lib/utils/routes';
	import { createMyEntriesStore } from '$lib/stores/my-entries.svelte';
	import { createMapPopup } from '$lib/stores/map-popup.svelte';
	import { createPreDetailCamera } from '$lib/stores/pre-detail-camera.svelte';
	import { dev } from '$app/environment';

	interface MapProps {
		entries?: EntryFeatureCollection;
	}

	interface EntryFocusOptions {
		offset?: [number, number];
		openPopup?: boolean;
	}

	const BBOX_SYNC_DEBOUNCE_MS = 100;
	const FOCUS_DURATION_MS = 1000;
	// Tailwind `lg` breakpoint: the editor drawer only widens at/above this width
	// (see SidebarShell's `lg:w-[var(--map-editor-width)]`).
	const LG_BREAKPOINT_PX = 1024;
	const EMPTY_ENTRIES: EntryFeatureCollection = {
		type: 'FeatureCollection',
		features: []
	};

	let { entries }: MapProps = $props();

	const mapEntries = $derived(entries ?? EMPTY_ENTRIES);
	const isMobile = new IsMobile();

	// The drawer widens to MAP_EDITOR_WIDTH_PX in editor mode on lg+ screens, so
	// focus offsets and fit-bounds padding must clear that width — otherwise a
	// focused marker (and its popup / network fit) can land under the wider editor.
	const isEditorRoute = $derived(!!page.data.editorData || !!page.data.depotEditorData);
	function activeSidebarWidth(): number {
		return isEditorRoute && window.innerWidth >= LG_BREAKPOINT_PX
			? MAP_EDITOR_WIDTH_PX
			: MAP_SIDEBAR_WIDTH_PX;
	}

	// Offset that keeps a focused point clear of the sidebar/bottom sheet.
	function currentFocusOffset(): [number, number] {
		return getSidebarFocusOffset({
			isMobile: isMobile.current,
			viewportHeight: window.innerHeight,
			sidebarWidth: activeSidebarWidth()
		});
	}

	function currentFitPadding() {
		return getSidebarFitPadding({
			isMobile: isMobile.current,
			viewportHeight: window.innerHeight,
			sidebarWidth: activeSidebarWidth()
		});
	}

	// Combine the sidebar/sheet clearance offset with a marker-specific nudge
	// (e.g. a spidered cluster icon's position) so the entry both clears the
	// chrome and stays aligned with the tapped marker. The popup keeps the raw
	// marker offset, so it still anchors to the icon.
	function focusOffsetWith(markerOffset?: [number, number]): [number, number] {
		const [baseX, baseY] = currentFocusOffset();
		const [markerX, markerY] = markerOffset ?? [0, 0];
		return [baseX + markerX, baseY + markerY];
	}

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

	let map: MaplibreMap | undefined = $state();
	let sidebarComponent: MapSidebar | undefined = $state();

	const popup = createMapPopup();
	let currentZoom: number = $state(initialZoom);
	let selectedCountry = $state(country);
	let selectedState: string | null = $state(null);
	let pendingFocus: {
		feature: EntryFeature;
		options?: EntryFocusOptions;
	} | null = $state(null);
	let pendingDiscoveryFocus: DiscoveryFocus | null = $state(null);
	let lastDiscoveryFocusKey: string | null = $state(null);
	let sidebarEntries: EntryFeatureCollection = $state(EMPTY_ENTRIES);
	const discoveryFocus = $derived(page.data.discoveryFocus);
	const myEntriesStore = createMyEntriesStore();

	// Farm/initiative network: rendered for any open main-entry profile, so the
	// entry itself is highlighted; a farm's depot lines/highlights additionally
	// appear when it has depots.
	const detailData = $derived(page.data.detailData);
	// The contact route frames its entry exactly like the detail route (see
	// `focusedEntry` in MapSidebar), so everything the map hangs off "an entry is
	// open" — network layer, marker selection, pre-detail camera — reads this
	// rather than `detailData` alone. Without it a contact deep link for a farm
	// with depots would never move the map: focusEntry defers network farms to the
	// fitBounds effect below, which would find nothing to fit.
	const focusedEntryData = $derived<MainEntryFeature | undefined>(
		detailData ?? page.data.contactData
	);
	// The subset of the above that's a farm with depots, used to drive the
	// network fitBounds camera (initiatives and depot-less farms have no network
	// to fit, so they fall back to the plain focusEntry flyTo instead).
	const networkFarmWithDepots = $derived(
		isFarmWithDepots(focusedEntryData) ? focusedEntryData : null
	);
	// Hover key of the entry whose profile is open, so its marker stays visually
	// selected until the profile closes (spec F13).
	const selectedEntryKey = $derived(
		focusedEntryData ? entryHoverKey(focusedEntryData.properties) : null
	);
	const highlightedNetworkIds = $derived.by<SvelteSet<string>>(() => {
		const ids = new SvelteSet<string>();
		if (focusedEntryData) {
			ids.add(focusedEntryData.properties.id);
			for (const depot of networkFarmWithDepots?.properties.depots?.features ?? []) {
				ids.add(depot.properties.id);
			}
		}
		return ids;
	});

	// Fit the viewport to the whole network when a farm profile with depots opens.
	// Depot-less farms and initiatives are framed by the plain focusEntry flyTo
	// instead (see focusEntry), so there's nothing to fit here for them.
	let lastNetworkFitFarmId = $state<string | null>(null);
	$effect(() => {
		if (!map || !networkFarmWithDepots) {
			lastNetworkFitFarmId = null;
			return;
		}

		if (networkFarmWithDepots.properties.id === lastNetworkFitFarmId) {
			return;
		}
		lastNetworkFitFarmId = networkFarmWithDepots.properties.id;

		const bounds = new LngLatBounds();
		bounds.extend(networkFarmWithDepots.geometry.coordinates as [number, number]);
		for (const depot of networkFarmWithDepots.properties.depots?.features ?? []) {
			bounds.extend(depot.geometry.coordinates as [number, number]);
		}

		map.fitBounds(bounds, {
			padding: currentFitPadding(),
			maxZoom: zoom.searchResult,
			duration: FOCUS_DURATION_MS
		});
	});

	const countryOptions = getCountryOptions();
	const stateOptions = $derived(getRegionOptionsForCountry(selectedCountry));
	const mapControlsPosition = 'top-right' as const;
	const attributionControlOptions = {
		compact: true,
		customAttribution: buildMapAttribution()
	};

	const preDetailCamera = createPreDetailCamera({
		map: () => map,
		isDetailOpen: () => !!focusedEntryData,
		duration: FOCUS_DURATION_MS
	});

	function applyFocusToMap(feature: EntryFeature, options?: EntryFocusOptions) {
		if (!map) return;
		map.flyTo(
			buildEntryFlyToOptions(feature, map.getZoom(), {
				offset: focusOffsetWith(options?.offset)
			})
		);
	}

	function applyDiscoveryFocusToMap(focus: DiscoveryFocus) {
		if (!map) {
			pendingDiscoveryFocus = focus;
			return;
		}

		popup.clear();
		pendingFocus = null;
		pendingDiscoveryFocus = null;

		map.flyTo({
			center: [focus.longitude, focus.latitude],
			zoom: zoom.searchResult,
			offset: currentFocusOffset(),
			duration: FOCUS_DURATION_MS
		});
	}

	function focusEntry(feature: EntryFeature, options?: EntryFocusOptions) {
		// Opening a detail from the map/list (no detail open yet) is the moment to
		// remember the current viewport, before the fly-to reframes it (F12.3).
		preDetailCamera.remember();

		if (options?.openPopup) {
			popup.pin(feature);
		}

		// A farm with depots is framed by the network `fitBounds` effect; issuing a
		// plain flyTo here as well would race it (same reactive flush) and can win,
		// leaving the depots off-screen. Let the network effect own the camera.
		if (isFarmWithDepots(feature)) {
			pendingFocus = null;
			return;
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
			offset: currentFocusOffset(),
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
			padding: currentFitPadding(),
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

	// Empty-state "reset filters / zoom out": always drop the region filter and
	// zoom back out to the whole country, even when no region filter was set (the
	// common case where the user simply panned into a sparse area).
	function handleResetView() {
		selectedState = null;
		focusCountry(selectedCountry);
	}

	function handleDetailClose() {
		// Close the map popup when the detail view is closed. Note this also fires on
		// popup dismissal while the profile stays open, so it must NOT clear the depot
		// selection — that is done on the actual profile close (MapSidebar).
		popup.clear();
		pendingFocus = null;
	}

	function handleMapEntryClick(
		feature: Feature<Geometry, GeoJsonProperties>,
		options?: { offset?: [number, number] }
	) {
		const entry = asEntryFeature(feature);
		if (!entry) {
			// Cluster (or other non-entry) feature: fly toward it, but show no detail view.
			if (map && feature.geometry.type === 'Point') {
				map.flyTo(
					buildFlyToOptions(feature.geometry.coordinates, map.getZoom(), {
						offset: focusOffsetWith(options?.offset)
					})
				);
			}
			handleDetailClose();
			return;
		}

		// Remember the depot so the resolved farm profile emphasizes its connection.
		if (entry.properties.type === 'Depot') {
			networkSelection.selectDepot(entry.properties.id);
		}

		focusEntry(entry, { ...options, openPopup: true });
		sidebarComponent?.openDetailView(entry);
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

		const scheduleSync = () => debouncedSidebarSync.trigger();

		mapInstance.on('moveend', scheduleSync);
		mapInstance.on('zoomend', scheduleSync);

		return () => {
			mapInstance.off('moveend', scheduleSync);
			mapInstance.off('zoomend', scheduleSync);
			debouncedSidebarSync.cancel();
		};
	});

	const circleBaseRadius = $derived(currentZoom * 0.75);
	const layerOpacity = $derived(focusedEntryData ? 0.5 : 1);
	const showSidebar = $derived(!isInternalDesignRouteHash(page.url.hash));

	// `/` and ⌘K focus the drawer search. The listener lives on the app-root
	// element (below), so it only ever sees keystrokes originating inside the app
	// — an embed can never capture keys typed in the surrounding host page.
	function handleAppRootKeydown(event: KeyboardEvent) {
		if (!isSearchShortcut(event)) {
			return;
		}
		event.preventDefault();
		sidebarComponent?.focusSearch();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="map-container" bind:this={mapRoot} onkeydown={handleAppRootKeydown}>
	<UserNavigation />
	<AccountTokenHandler />
	{#if showSidebar}
		<MapSidebar
			bind:this={sidebarComponent}
			entries={sidebarEntries}
			myEntries={myEntriesStore.entries}
			isMyEntriesLoading={myEntriesStore.isLoading}
			myEntriesError={myEntriesStore.hasError}
			onRefreshMyEntries={myEntriesStore.refresh}
			onEntryClick={focusEntry}
			onDetailClose={handleDetailClose}
			onRestoreDetailView={preDetailCamera.restore}
			{countryOptions}
			{stateOptions}
			{selectedCountry}
			{selectedState}
			onCountryChange={handleCountryChange}
			onStateChange={handleStateChange}
			onResetView={handleResetView}
		/>
	{/if}
	{#if mapStyle && mapTheme}
		<MapLibre
			bind:map
			class="map"
			style={mapStyle}
			center={[center[1], center[0]]}
			zoom={initialZoom}
			minZoom={zoom.min}
			maxZoom={zoom.max}
			attributionControl={attributionControlOptions}
			onzoom={() => {
				currentZoom = map?.getZoom() || initialZoom;
			}}
		>
			<NavigationControl position={mapControlsPosition} />
			<GeolocateControl position={mapControlsPosition} />

			<EntryLayers
				entries={mapEntries}
				theme={mapTheme}
				zoom={currentZoom}
				{circleBaseRadius}
				opacity={layerOpacity}
				highlightedIds={highlightedNetworkIds}
				selectedKey={selectedEntryKey}
				hoveredDepotId={popup.hoveredDepotId}
				onFeatureClick={handleMapEntryClick}
				onEntryHover={popup.hover}
				onLeave={popup.revertToPinned}
			/>

			{#if focusedEntryData}
				<NetworkLayer
					entry={focusedEntryData}
					selectedDepotId={networkSelection.selectedDepotId}
					theme={mapTheme}
					{circleBaseRadius}
				/>
			{/if}

			{#if popup.entry}
				<Popup
					bind:isPopupOpen={() => popup.isOpen, (value) => (popup.isOpen = value)}
					selectedEntry={popup.entry}
					onclose={popup.clear}
				/>
			{/if}
		</MapLibre>
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
</style>

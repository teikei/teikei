<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		GeolocateControl,
		GeoJSON,
		CircleLayer
	} from 'svelte-maplibre';
	import { LngLatBounds, type Map as MaplibreMap } from 'maplibre-gl';
	import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
	import { page } from '$app/state';
	import { onMount, untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { getMapStyle } from '$lib/design/map-style';
	import config from '$lib/config/app-configuration';
	import { readMapDesignTokens, type MapDesignTokens } from '$lib/design/themes';
	import type {
		EntryFeature,
		EntryFeatureCollection,
		FarmFeature,
		MainEntryFeature
	} from '$lib/types/entries';
	import type { DiscoveryFocus } from '$lib/types/discovery';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { AccountTokenHandler, UserNavigation } from '$lib/components/layout';
	import MapSidebar from './MapSidebar.svelte';
	import { NetworkLayer, Popup, SymbolMarkerLayer } from '$lib/components/domain/map';
	import { networkSelection } from '$lib/stores/network-selection.svelte';
	import { entryHoverKey } from '$lib/stores/hovered-entry.svelte';
	import { MAP_SIDEBAR_WIDTH_PX, MAP_EDITOR_WIDTH_PX } from '$lib/config/layout';
	import { asEntryFeature } from '$lib/utils/entry-features';
	import {
		buildEntryFlyToOptions,
		buildFlyToOptions,
		getSidebarFocusOffset
	} from '$lib/utils/map-focus';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
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

	const BBOX_SYNC_DEBOUNCE_MS = 100;
	const FOCUS_DURATION_MS = 1000;
	const REGION_FOCUS_PADDING_PX = 64;
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

	let selectedEntry: {
		feature: EntryFeature;
		options?: EntryFocusOptions;
	} | null = $state(null);
	let isPopupOpen = $state(false);
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
	const networkEntry = $derived<MainEntryFeature | null>(focusedEntryData ?? null);
	// The subset of the above that's a farm with depots, used to drive the
	// network fitBounds camera (initiatives and depot-less farms have no network
	// to fit, so they fall back to the plain focusEntry flyTo instead).
	const networkFarmWithDepots = $derived.by<FarmFeature | null>(() => {
		if (
			networkEntry?.properties.type === 'Farm' &&
			(networkEntry.properties.depots?.features?.length ?? 0) > 0
		) {
			return networkEntry as FarmFeature;
		}
		return null;
	});
	// Hover key of the entry whose profile is open, so its marker stays visually
	// selected until the profile closes (spec F13).
	const selectedEntryKey = $derived(
		focusedEntryData ? entryHoverKey(focusedEntryData.properties) : null
	);
	const highlightedNetworkIds = $derived.by<SvelteSet<string>>(() => {
		const ids = new SvelteSet<string>();
		if (networkEntry) {
			ids.add(networkEntry.properties.id);
			for (const depot of networkFarmWithDepots?.properties.depots?.features ?? []) {
				ids.add(depot.properties.id);
			}
		}
		return ids;
	});

	// Fit the viewport to the whole network when a farm profile with depots opens.
	// Depot-less farms and initiatives are framed by the plain focusEntry flyTo
	// instead (see featureIsNetworkFarm), so there's nothing to fit here for them.
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

		// Keep the network clear of the sidebar chrome: the floating left sidebar on
		// desktop, the bottom sheet (covering the lower half) on mobile.
		const padding = isMobile.current
			? {
					top: REGION_FOCUS_PADDING_PX,
					right: REGION_FOCUS_PADDING_PX,
					bottom: REGION_FOCUS_PADDING_PX + Math.round(window.innerHeight / 2),
					left: REGION_FOCUS_PADDING_PX
				}
			: {
					top: REGION_FOCUS_PADDING_PX,
					right: REGION_FOCUS_PADDING_PX,
					bottom: REGION_FOCUS_PADDING_PX,
					left: REGION_FOCUS_PADDING_PX + activeSidebarWidth()
				};

		map.fitBounds(bounds, {
			padding,
			maxZoom: zoom.searchResult,
			duration: FOCUS_DURATION_MS
		});
	});

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

	// Camera snapshot taken the moment a detail view is opened from the list, so
	// the slim-header "back" affordance can restore the previous viewport (F12.3).
	let preDetailCamera: {
		center: [number, number];
		zoom: number;
		bearing: number;
		pitch: number;
	} | null = null;

	function snapshotPreDetailCamera() {
		if (!map) return;
		const center = map.getCenter();
		preDetailCamera = {
			center: [center.lng, center.lat],
			zoom: map.getZoom(),
			bearing: map.getBearing(),
			pitch: map.getPitch()
		};
	}

	// Fly back to the viewport the user was looking at before the detail opened.
	// Invoked by the sidebar's back affordance; a plain close leaves the camera put.
	function restorePreDetailView() {
		if (!map || !preDetailCamera) return;
		map.flyTo({
			center: preDetailCamera.center,
			zoom: preDetailCamera.zoom,
			bearing: preDetailCamera.bearing,
			pitch: preDetailCamera.pitch,
			duration: FOCUS_DURATION_MS
		});
		preDetailCamera = null;
	}

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

		selectedEntry = null;
		isPopupOpen = false;
		pendingFocus = null;
		pendingDiscoveryFocus = null;

		map.flyTo({
			center: [focus.longitude, focus.latitude],
			zoom: zoom.searchResult,
			offset: currentFocusOffset(),
			duration: FOCUS_DURATION_MS
		});
	}

	function featureIsNetworkFarm(feature: EntryFeature): boolean {
		return (
			feature.properties.type === 'Farm' && (feature.properties.depots?.features?.length ?? 0) > 0
		);
	}

	function focusEntry(feature: EntryFeature, options?: EntryFocusOptions) {
		// Opening a detail from the map/list (no detail open yet) is the moment to
		// remember the current viewport, before the fly-to reframes it (F12.3).
		if (!focusedEntryData) {
			snapshotPreDetailCamera();
		}

		selectedEntry = { feature, options };
		if (options?.openPopup) {
			isPopupOpen = true;
		}

		// A farm with depots is framed by the network `fitBounds` effect; issuing a
		// plain flyTo here as well would race it (same reactive flush) and can win,
		// leaving the depots off-screen. Let the network effect own the camera.
		if (featureIsNetworkFarm(feature)) {
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

		// Desktop keeps the region clear of the left sidebar; mobile keeps it above
		// the half-height bottom sheet.
		const padding = isMobile.current
			? {
					top: REGION_FOCUS_PADDING_PX,
					right: REGION_FOCUS_PADDING_PX,
					bottom: Math.round(window.innerHeight / 2),
					left: REGION_FOCUS_PADDING_PX
				}
			: {
					top: REGION_FOCUS_PADDING_PX,
					right: REGION_FOCUS_PADDING_PX,
					bottom: REGION_FOCUS_PADDING_PX,
					left: REGION_FOCUS_PADDING_PX + activeSidebarWidth()
				};

		map.fitBounds(regionBounds, {
			padding,
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

		focusEntry(entry, options);
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
			// Remember the last settled browsing camera while no detail is open, so a
			// detail reached by a route-only path (search suggestion, deep link after
			// browsing) — which never runs focusEntry before navigation — can still
			// restore the previous viewport on Back (F12.3). The detail-open fly-to
			// settles with the entry already set, so it does not overwrite this.
			if (!focusedEntryData) {
				snapshotPreDetailCamera();
			}
		};

		mapInstance.on('moveend', scheduleSync);
		mapInstance.on('zoomend', scheduleSync);

		return () => {
			mapInstance.off('moveend', scheduleSync);
			mapInstance.off('zoomend', scheduleSync);
			debouncedSidebarSync.cancel();
		};
	});

	// Capture the initial browsing camera once the map is ready, so a search-opened
	// detail with no prior map movement can still restore on Back. Reads the entry
	// untracked so this fires once (on map init), not on every detail change.
	let didCaptureInitialCamera = false;
	$effect(() => {
		if (!map || didCaptureInitialCamera) return;
		didCaptureInitialCamera = true;
		if (!untrack(() => focusedEntryData)) {
			snapshotPreDetailCamera();
		}
	});

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

	let hoveredDepotFeatureId: string | null = $state(null);

	const circleBaseRadius = $derived(currentZoom * 0.75);
	const showSidebar = $derived(!isInternalDesignRouteHash(page.url.hash));

	function isEditableTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) {
			return false;
		}
		const tag = target.tagName;
		return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
	}

	// `/` and ⌘K focus the drawer search. The listener lives on the app-root
	// element (below), so it only ever sees keystrokes originating inside the app
	// — an embed can never capture keys typed in the surrounding host page.
	function handleAppRootKeydown(event: KeyboardEvent) {
		const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
		const isSlash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey;
		if (!isCmdK && !isSlash) {
			return;
		}
		// Don't hijack a literal "/" typed into a field (including the search input).
		if (isSlash && isEditableTarget(event.target)) {
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
			onRestoreDetailView={restorePreDetailView}
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

			{#if networkEntry}
				<NetworkLayer
					entry={networkEntry}
					selectedDepotId={networkSelection.selectedDepotId}
					theme={mapTheme}
				/>
			{/if}

			<GeoJSON
				id="secondary-places"
				data={secondaryPlaces}
				cluster={currentZoom < 11 ? { radius: circleBaseRadius * 0.6 } : undefined}
			>
				<CircleLayer
					id="secondary-points"
					beforeId="label-boundary-state"
					paint={{
						'circle-color': mapTheme.secondaryPlaceColor,
						'circle-radius': circleBaseRadius * 0.5,
						'circle-opacity': ['interpolate', ['linear'], ['zoom'], zoom.min, 0.75, 9, 0.9]
					}}
					hoverCursor="pointer"
					minzoom={zoom.min}
					onclick={(e) => handleMapEntryClick(e.features?.[0])}
					onmousemove={(e) => {
						hoveredDepotFeatureId = e.features?.[0]?.properties?.id ?? null;
					}}
					onmouseleave={() => {
						hoveredDepotFeatureId = null;
					}}
				/>

				{#if hoveredDepotFeatureId}
					<CircleLayer
						id="secondary-hovered-point"
						beforeId="label-boundary-state"
						filter={['==', ['get', 'id'], hoveredDepotFeatureId]}
						paint={{
							'circle-color': mapTheme.secondaryPlaceColor,
							'circle-radius': circleBaseRadius * 0.8,
							'circle-opacity': 1
						}}
						hoverCursor="pointer"
						minzoom={9.5}
						onclick={(e) => handleMapEntryClick(e.features?.[0])}
					/>
				{/if}
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
					onclick={(e) => handleMapEntryClick(e.features?.[0])}
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
					onclick={(e) => handleMapEntryClick(e.features?.[0])}
				></CircleLayer>

				<SymbolMarkerLayer
					onMarkerClick={handleMapEntryClick}
					minzoom={9.5}
					highlightedIds={highlightedNetworkIds}
					selectedKey={selectedEntryKey}
				/>
			</GeoJSON>

			{#if selectedEntry}
				<Popup bind:isPopupOpen bind:selectedEntry onclose={handleDetailClose} />
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

	:global(.maplibregl-ctrl-top-right) {
		top: 3.75rem;
		right: 0.11rem;
	}

	/*
	 * Align MapLibre's native controls with the app's floating chrome: card
	 * surface, the rounded-4xl radius step, and the resting shadow-md elevation
	 * (see DESIGN.md "Radius & Elevation"). Values reference the same semantic
	 * tokens the Tailwind utilities are generated from.
	 */
	:global(.maplibregl-ctrl.maplibregl-ctrl-group) {
		overflow: hidden;
		border-radius: calc(var(--radius) * 2.6); /* = rounded-4xl */
		border: 1px solid var(--border);
		background: var(--card);
		/* = shadow-md, on the foreground token like the popup card */
		box-shadow:
			0 4px 6px -1px color-mix(in srgb, var(--foreground) 10%, transparent),
			0 2px 4px -2px color-mix(in srgb, var(--foreground) 10%, transparent);
	}

	:global(.maplibregl-ctrl-group button) {
		width: 40px;
		height: 40px;
	}

	:global(.maplibregl-ctrl-group button + button) {
		border-top: 1px solid var(--border);
	}

	@media (pointer: coarse) {
		:global(.maplibregl-ctrl-group button) {
			width: 44px;
			height: 44px;
		}
	}

	:global(.maplibregl-ctrl-attrib) {
		border-radius: calc(var(--radius) * 0.8); /* = rounded-md */
	}

	/*
	 * On mobile the sidebar becomes a bottom sheet anchored to the viewport
	 * bottom (peek height ~156px). Lift the bottom map attribution/controls above
	 * the peek sheet so nothing is permanently hidden behind it.
	 */
	@media (max-width: 767px) {
		:global(.maplibregl-ctrl-bottom-right),
		:global(.maplibregl-ctrl-bottom-left) {
			bottom: var(--bottom-sheet-peek-height);
		}
	}
</style>

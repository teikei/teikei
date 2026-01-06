<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		GeolocateControl,
		GeoJSON,
		CircleLayer,
		Popup
	} from 'svelte-maplibre';
	import type { Map as MaplibreMap, LngLatLike } from 'maplibre-gl';
	import { getMapStyle } from './map-style';
	import { clusterPaint, unclusteredPointPaint } from './layers';
	import config from '$lib/config/app-configuration';
	import type { FeatureCollection, Feature, Point } from 'geojson';
	import type { EntryProperties, EntryFeature } from '$lib/types/entries';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import UserNavigation from '$lib/components/app/UserNavigation.svelte';
	import EntryCard from '$lib/components/app/EntryCard.svelte';
	import MapSidebar from './MapSidebar.svelte';

	interface MapProps {
		entries?: FeatureCollection;
	}

	let { entries }: MapProps = $props();

	const { countries, country, zoom } = config;
	const { center, zoom: defaultZoom } = countries[country as keyof typeof countries];

	const mapStyle = getMapStyle();

	// Map instance reference
	let map: MaplibreMap | undefined = $state();

	// Selected entry state for programmatic popup
	let selectedEntry: EntryFeature | null = $state(null);
	let selectedEntryLngLat: LngLatLike | null = $state(null);
	let isPopupOpen = $state(false);

	function handleEntryClick(feature: Feature<Point, EntryProperties>) {
		const [lng, lat] = feature.geometry.coordinates;
		selectedEntry = feature as EntryFeature;
		selectedEntryLngLat = [lng, lat];

		// Pan the map to center the entry in the visible area to the right of the sidebar
		if (map) {
			const sidebarWidth = 500; // matches the w-[500px] class on Sidebar.Root
			const mapContainer = map.getContainer();
			const viewportWidth = mapContainer.clientWidth;

			// The visible area to the right of the sidebar has width: (viewportWidth - sidebarWidth)
			// Its center is at: sidebarWidth + (viewportWidth - sidebarWidth) / 2
			// The map's center is at: viewportWidth / 2
			// Offset needed: visibleAreaCenter - mapCenter = sidebarWidth / 2
			const offsetX = sidebarWidth / 2;

			map.flyTo({
				center: [lng, lat],
				offset: [offsetX, 0],
				zoom: Math.max(map.getZoom(), 12),
				duration: 1000
			});
		}

		// Open the popup after a short delay to let the map start moving
		setTimeout(() => {
			isPopupOpen = true;
		}, 100);
	}

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
	<MapSidebar entries={filteredEntries} onEntryClick={handleEntryClick} />
	<MapLibre
		bind:map
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
							{@const entry = data.properties as EntryProperties}
							<div class="entry-popup">
								<EntryCard {entry} iconSize="size-4" />
							</div>
						{/if}
					{/snippet}
				</Popup>
			</CircleLayer>
		</GeoJSON>

		<!-- Programmatic popup for selected entry from sidebar -->
		{#if selectedEntry && selectedEntryLngLat}
			<Popup
				openOn="manual"
				bind:open={isPopupOpen}
				lngLat={selectedEntryLngLat}
				offset={[0, -5]}
				closeOnClickOutside={true}
				onclose={() => {
					isPopupOpen = false;
					selectedEntry = null;
				}}
			>
				<div class="entry-popup">
					<EntryCard entry={selectedEntry.properties} iconSize="size-4" />
				</div>
			</Popup>
		{/if}
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
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}
</style>

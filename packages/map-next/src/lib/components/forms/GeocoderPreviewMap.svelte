<script lang="ts" module>
	import type { EntryType } from '$lib/types/entries';

	export interface GeocoderPreviewMapProps {
		latitude: number;
		longitude: number;
		markerType: EntryType;
	}
</script>

<script lang="ts">
	import { MapLibre, Marker } from 'svelte-maplibre';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount } from 'svelte';
	import { getMapStyle } from '$lib/design/map-style';
	import { readMapDesignTokens, type MapDesignTokens } from '$lib/design/themes';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import config from '$lib/config/app-configuration';

	let { latitude, longitude, markerType }: GeocoderPreviewMapProps = $props();

	// Matches legacy `PreviewTile`'s zoom level; never exceeds the app-wide max
	// zoom, which is the existing location-precision/privacy mechanism.
	const PREVIEW_ZOOM = Math.min(14, config.zoom.max);

	let mapRoot: HTMLElement | undefined = $state();
	let mapStyle: ReturnType<typeof getMapStyle> | undefined = $state();

	onMount(() => {
		if (!mapRoot) {
			return;
		}
		const theme: MapDesignTokens = readMapDesignTokens(mapRoot);
		mapStyle = getMapStyle({ theme });
	});
</script>

<div
	bind:this={mapRoot}
	class="h-40 w-full overflow-hidden rounded-md border"
	data-testid="geocoder-preview-map"
>
	{#if mapStyle}
		<MapLibre
			class="h-full w-full"
			style={mapStyle}
			center={[longitude, latitude]}
			zoom={PREVIEW_ZOOM}
			interactive={false}
			attributionControl={false}
		>
			<Marker lngLat={[longitude, latitude]} interactive={false}>
				<img class="size-8" src={getPlaceIcon(markerType)} alt="" />
			</Marker>
		</MapLibre>
	{/if}
</div>

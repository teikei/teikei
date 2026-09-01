<script lang="ts">
	import { Popup } from 'svelte-maplibre';
	import * as m from '$lib/paraglide/messages.js';
	import type { DepotProperties, EntryFeature } from '$lib/types/entries';

	const MARKER_OFFSET = 18;

	interface PopupSelectedEntry {
		feature?: EntryFeature;
		lngLat?: [number, number];
		options?: {
			offset?: [number, number];
		};
	}

	let {
		isPopupOpen = $bindable(false),
		selectedEntry = $bindable<PopupSelectedEntry | null>(null),
		onclose = () => {}
	}: {
		isPopupOpen?: boolean;
		selectedEntry?: PopupSelectedEntry | null;
		onclose?: () => void;
	} = $props();

	const offset = $derived(selectedEntry?.options?.offset ?? [0, 0]);
	const feature = $derived(selectedEntry?.feature);
	const lngLat = $derived(
		selectedEntry?.lngLat
			? selectedEntry.lngLat
			: feature
				? ([feature.geometry.coordinates[0], feature.geometry.coordinates[1]] as [number, number])
				: undefined
	);

	// Depots carry pickup-relevant detail (street address, delivery days) that
	// the compact profile row hides behind this popup; surface it here so the
	// info stays reachable. Farms/initiatives keep the minimal name + city card.
	const depot = $derived<DepotProperties | undefined>(
		feature?.properties.type === 'Depot' ? feature.properties : undefined
	);
	const depotAddress = $derived(
		depot
			? [depot.address, [depot.postalcode, depot.city].filter(Boolean).join(' ')]
					.filter(Boolean)
					.join(', ')
			: ''
	);
</script>

<Popup
	openOn="manual"
	bind:open={isPopupOpen}
	{lngLat}
	offset={[offset[0], offset[1] - MARKER_OFFSET]}
	anchor="bottom"
	closeOnClickOutside={true}
	maxWidth="200px"
	{onclose}
>
	<div class="truncate font-medium">{feature?.properties.name}</div>
</Popup>

<style>
	/*
	 * Restyle the MapLibre popup as a flat card (spec F13): card background/
	 * foreground tokens, the app radius scale, and a restrained shadow —
	 * replacing the previous 0.8-opacity dark box. Works in every theme.
	 */
	:global(.map .maplibregl-popup) {
		opacity: 0.9;
	}
	:global(.map .maplibregl-popup-content) {
		background: var(--color-map-popup);
		color: var(--color-map-popup-foreground);
		border-radius: 0.5em;
		padding: 0.5em 1em;
	}
	:global(.map .maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
		border-top-color: var(--color-map-popup);
	}
	:global(.map .maplibregl-popup-close-button) {
		color: var(--muted-foreground);
	}
</style>

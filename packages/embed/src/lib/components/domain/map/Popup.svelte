<script lang="ts">
	import { Popup } from 'svelte-maplibre';
	import * as m from '$lib/paraglide/messages.js';
	import type { DepotProperties, EntryFeature } from '$lib/types/entries';

	const MARKER_OFFSET = 20;

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
	maxWidth="250px"
	{onclose}
>
	<div class="entry-popup">
		<div class="flex min-w-0 flex-col gap-0.5">
			<span class="truncate font-medium text-card-foreground">{feature?.properties.name}</span>
			{#if depot}
				{#if depotAddress}
					<span class="text-muted-foreground">{depotAddress}</span>
				{:else}
					<span class="truncate text-muted-foreground">{depot.city}</span>
				{/if}
				{#if depot.deliveryDays}
					<span class="text-muted-foreground">
						{m.editor_depot_field_delivery_days()}: {depot.deliveryDays}
					</span>
				{/if}
			{:else}
				<span class="truncate text-muted-foreground">
					{feature?.properties.city}
				</span>
			{/if}
		</div>
	</div>
</Popup>

<style>
	.entry-popup {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0rem 0.25rem;
	}

	/*
	 * Restyle the MapLibre popup as a flat card (spec F13): card background/
	 * foreground tokens, the app radius scale, and a restrained shadow —
	 * replacing the previous 0.8-opacity dark box. Works in every theme.
	 */
	:global(.map .maplibregl-popup-content) {
		background: var(--card);
		color: var(--card-foreground);
		border-radius: var(--radius);
		box-shadow: 0 4px 12px color-mix(in srgb, var(--foreground) 15%, transparent);
	}
	:global(.map .maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
		border-top-color: var(--card);
	}
	:global(.map .maplibregl-popup-close-button) {
		color: var(--muted-foreground);
	}
</style>

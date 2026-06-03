<script lang="ts">
	import { Popup } from 'svelte-maplibre';
	import type { EntryFeature } from '$lib/types/entries';

	const MARKER_OFFSET = 20;

	interface PopupSelectedEntry {
		feature: EntryFeature;
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
		feature
			? ([feature.geometry.coordinates[0], feature.geometry.coordinates[1]] as [number, number])
			: undefined
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
			<span class="truncate text-background">{feature?.properties.name}</span>
			<span class="truncate text-muted-foreground">
				{feature?.properties.city}
			</span>
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

	:global(.map) {
		--popup-bg-color: var(--map-popup);
		--popup-opacity: 0.8;
	}

	:global(.map .maplibregl-popup-content) {
		background: var(--popup-bg-color);
		opacity: var(--popup-opacity);
	}
	:global(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
		border-top-color: var(--popup-bg-color);
		opacity: var(--popup-opacity);
	}
</style>

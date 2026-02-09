<script lang="ts">
	import { Popup } from 'svelte-maplibre';
	import EntryCard from '$lib/components/app/EntryCard.svelte';

	const MARKER_OFFSET = 20;

	let {
		isPopupOpen = $bindable(false),
		selectedEntry = null,
		onclose = () => {}
	}: { isPopupOpen?: boolean; selectedEntry?: any; onclose?: () => void } = $props();

	const offset = $derived(selectedEntry?.options?.offset || [0, 0]);
	const feature = $derived(selectedEntry?.feature);
</script>

<Popup
	openOn="manual"
	bind:open={isPopupOpen}
	lngLat={feature?.geometry.coordinates}
	offset={[offset[0], offset[1] - MARKER_OFFSET]}
	anchor="bottom"
	closeOnClickOutside={true}
	{onclose}
>
	<div class="entry-popup">
		<EntryCard entry={feature?.properties} iconSize="size-4" />
	</div>
</Popup>

<style>
	.entry-popup {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}
</style>

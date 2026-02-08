<script lang="ts">
	import { Popup } from 'svelte-maplibre';
	import EntryCard from '$lib/components/app/EntryCard.svelte';

	export let isPopupOpen: boolean = false;
	export let selectedEntryLngLat: [number, number] | null = null;
	export let selectedEntry: any = null;
	export let onclose: () => void = () => {};
</script>

<Popup
	openOn="manual"
	bind:open={isPopupOpen}
	lngLat={selectedEntryLngLat}
	offset={[0, -20]}
	closeOnClickOutside={true}
	{onclose}
>
	<div class="entry-popup">
		<EntryCard entry={selectedEntry.properties} iconSize="size-4" />
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

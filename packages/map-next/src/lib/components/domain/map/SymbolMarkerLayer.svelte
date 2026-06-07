<script lang="ts">
	import { MarkerLayer } from 'svelte-maplibre';
	import type { EntryFeature } from '$lib/types/entries';
	import { asEntryFeature } from '$lib/utils/entry-features';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import SymbolMarkerCluster from './SymbolMarkerCluster.svelte';

	interface SymbolMarkerLayerProps {
		onMarkerClick: (feature: EntryFeature, options?: { offset?: [number, number] }) => void;
		minzoom?: number;
	}

	let { onMarkerClick, minzoom }: SymbolMarkerLayerProps = $props();
</script>

<!-- Cluster markers -->
<MarkerLayer applyToClusters hoverCursor="pointer" {minzoom}>
	{#snippet children({ feature })}
		<SymbolMarkerCluster {feature} {onMarkerClick} />
	{/snippet}
</MarkerLayer>

<!-- Individual markers -->
<MarkerLayer applyToClusters={false} hoverCursor="pointer" {minzoom}>
	{#snippet children({ feature })}
		{@const entry = asEntryFeature(feature)}
		{#if entry}
			{@const type = entry.properties.type.toLowerCase()}
			<button type="button" onclick={() => onMarkerClick(entry)}>
				<img class="marker-icon" src={getPlaceIcon(type)} alt={entry.properties.name || type} />
			</button>
		{/if}
	{/snippet}
</MarkerLayer>

<style>
	.marker-icon {
		width: 30px;
		height: 30px;
		cursor: pointer;
	}
</style>

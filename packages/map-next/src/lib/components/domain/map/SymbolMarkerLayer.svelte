<script lang="ts">
	import { MarkerLayer } from 'svelte-maplibre';
	import type { EntryFeature } from '$lib/types/entries';
	import { asEntryFeature } from '$lib/utils/entry-features';
	import EntryMarkerButton from './EntryMarkerButton.svelte';
	import SymbolMarkerCluster from './SymbolMarkerCluster.svelte';

	interface SymbolMarkerLayerProps {
		onMarkerClick: (feature: EntryFeature, options?: { offset?: [number, number] }) => void;
		minzoom?: number;
		/** Entry ids to emphasize while a farm↔depot network is open (shared state). */
		highlightedIds?: ReadonlySet<string>;
		/** Hover key of the entry whose profile is open; its marker stays selected. */
		selectedKey?: string | null;
	}

	let { onMarkerClick, minzoom, highlightedIds, selectedKey }: SymbolMarkerLayerProps = $props();
</script>

<!-- Cluster markers -->
<MarkerLayer applyToClusters {minzoom}>
	{#snippet children({ feature })}
		<SymbolMarkerCluster {feature} {onMarkerClick} {highlightedIds} {selectedKey} />
	{/snippet}
</MarkerLayer>

<!-- Individual markers -->
<MarkerLayer applyToClusters={false} {minzoom}>
	{#snippet children({ feature })}
		{@const entry = asEntryFeature(feature)}
		{#if entry}
			<EntryMarkerButton
				{entry}
				onClick={() => onMarkerClick(entry)}
				{highlightedIds}
				{selectedKey}
			/>
		{/if}
	{/snippet}
</MarkerLayer>

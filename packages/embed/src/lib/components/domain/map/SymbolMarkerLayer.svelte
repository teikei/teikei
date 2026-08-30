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
		onMarkerHover?: (feature: EntryFeature, options?: { offset?: [number, number] }) => void;
		onMarkerLeave?: () => void;
		opacity?: number;
	}

	let {
		onMarkerClick,
		onMarkerHover,
		onMarkerLeave,
		minzoom,
		highlightedIds,
		selectedKey,
		opacity = 1
	}: SymbolMarkerLayerProps = $props();
</script>

<MarkerLayer applyToClusters {minzoom}>
	{#snippet children({ feature })}
		<SymbolMarkerCluster
			{feature}
			{onMarkerClick}
			{onMarkerHover}
			{onMarkerLeave}
			{highlightedIds}
			{selectedKey}
			{opacity}
		/>
	{/snippet}
</MarkerLayer>

<MarkerLayer applyToClusters={false} {minzoom}>
	{#snippet children({ feature })}
		{@const entry = asEntryFeature(feature)}
		{#if entry}
			<EntryMarkerButton
				{entry}
				onClick={() => onMarkerClick(entry)}
				onHover={() => onMarkerHover?.(entry)}
				onLeave={onMarkerLeave}
				{selectedKey}
				{opacity}
			/>
		{/if}
	{/snippet}
</MarkerLayer>

<script lang="ts">
	import type { EntryFeature } from '$lib/types/entries';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import { entryHoverKey, hoveredEntry } from '$lib/stores/hovered-entry.svelte';
	import { cn } from '$lib/utils/tailwind';

	interface EntryMarkerButtonProps {
		entry: EntryFeature;
		onClick: () => void;
		/** Entry ids to emphasize while a farm↔depot network is open (shared state). */
		highlightedIds?: ReadonlySet<string>;
		/** Hover key of the entry whose profile is open; its marker stays selected. */
		selectedKey?: string | null;
		/** Extra classes, e.g. for cluster-specific positioning. */
		class?: string;
	}

	let {
		entry,
		onClick,
		highlightedIds,
		selectedKey,
		class: className
	}: EntryMarkerButtonProps = $props();

	const type = $derived(entry.properties.type.toLowerCase());
	const isNetworkHighlighted = $derived(highlightedIds?.has(entry.properties.id) ?? false);
	const hoverKey = $derived(entryHoverKey(entry.properties));
	const isHovered = $derived(hoveredEntry.key === hoverKey);
	const isSelected = $derived(selectedKey != null && selectedKey === hoverKey);
</script>

<button
	type="button"
	onclick={onClick}
	onmouseenter={() => hoveredEntry.setHover(entry.properties, 'map')}
	onmouseleave={() => hoveredEntry.clear(entry.properties)}
	class={cn(
		'marker-button',
		isNetworkHighlighted && 'marker-button--network',
		isHovered && 'marker-button--highlighted',
		isSelected && 'marker-button--selected',
		className
	)}
>
	<img class="marker-icon" src={getPlaceIcon(type)} alt={entry.properties.name || type} />
</button>

<style>
	.marker-button {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 45px;
		height: 45px;
		cursor: pointer;
		--marker-drop-shadow: drop-shadow(0 2px 5px var(--base-color-map-network));
	}

	.marker-icon {
		position: relative;
		width: 30px;
		height: 30px;
		transition:
			transform 150ms ease,
			filter 150ms ease;
		transform-origin: bottom center;
		filter: var(--marker-drop-shadow);
	}

	.marker-button--highlighted {
		transform: scale(1.2);
		filter: drop-shadow(0 2px 10px var(--base-color-map-network));
	}

	.marker-button--selected {
		transform: scale(1.2);
	}
</style>

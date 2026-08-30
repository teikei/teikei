<script lang="ts">
	import type { EntryFeature } from '$lib/types/entries';
	import { getPlaceIcon } from '$lib/utils/marker-icons';
	import { entryHoverKey, hoveredEntry } from '$lib/stores/hovered-entry.svelte';

	interface EntryMarkerButtonProps {
		entry: EntryFeature;
		onClick: () => void;
		/** Hover key of the entry whose profile is open; its marker stays selected. */
		selectedKey?: string | null;
		/** Extra classes, e.g. for cluster-specific positioning. */
		class?: string;
		onHover?: () => void;
		onLeave?: () => void;
	}

	let {
		entry,
		onClick,
		selectedKey,
		class: className,
		onHover,
		onLeave
	}: EntryMarkerButtonProps = $props();

	const type = $derived(entry.properties.type.toLowerCase());
	const hoverKey = $derived(entryHoverKey(entry.properties));
	const isHovered = $derived(hoveredEntry.key === hoverKey);
	const isSelected = $derived(selectedKey != null && selectedKey === hoverKey);
</script>

<button
	type="button"
	aria-label={entry.properties.name || type}
	onclick={onClick}
	onmouseenter={() => {
		hoveredEntry.setHover(entry.properties, 'map');
		onHover?.();
	}}
	onmouseleave={() => {
		hoveredEntry.clear(entry.properties);
		onLeave?.();
	}}
	class={['marker-button', className]}
	class:marker-button--highlighted={isHovered || isSelected}
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
		--marker-drop-shadow: drop-shadow(0 2px 5px var(--map-network-line));
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
		filter: drop-shadow(0 2px 10px var(--map-network-line));
	}
</style>

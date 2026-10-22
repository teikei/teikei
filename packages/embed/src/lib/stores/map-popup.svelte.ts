import type { EntryFeature } from '$lib/types/entries';
import { entryHoverKey } from './hovered-entry.svelte';

export interface PopupEntry {
	feature: EntryFeature;
	options?: { offset?: [number, number] };
}

export interface MapPopup {
	readonly entry: PopupEntry | null;
	isOpen: boolean;
	/** Depot whose marker gets the hover overlay while its popup is shown. */
	readonly hoveredDepotId: string | null;
	pin(feature: EntryFeature): void;
	hover(feature: EntryFeature, options?: PopupEntry['options']): void;
	revertToPinned(): void;
	clear(): void;
}

/**
 * The map's single marker popup. A click pins it to an entry, so it survives
 * the pointer leaving that marker; hovering shows a transient popup, and
 * hovering a different marker breaks the pin.
 */
export function createMapPopup(): MapPopup {
	let entry = $state<PopupEntry | null>(null);
	let isOpen = $state(false);
	let pinned = $state<EntryFeature | null>(null);

	const hoveredDepotId = $derived(
		entry?.feature.properties.type === 'Depot' ? entry.feature.properties.id : null
	);

	function show(feature: EntryFeature, options?: PopupEntry['options']) {
		entry = { feature, options };
		isOpen = true;
	}

	function close() {
		entry = null;
		isOpen = false;
	}

	return {
		get entry() {
			return entry;
		},
		get isOpen() {
			return isOpen;
		},
		set isOpen(value: boolean) {
			isOpen = value;
		},
		get hoveredDepotId() {
			return hoveredDepotId;
		},
		// Ignores any hover-time cluster-spread offset: a click always pans/zooms to
		// the entry's own point, so the popup anchors there with no pixel nudge.
		pin(feature) {
			pinned = feature;
			show(feature);
		},
		hover(feature, options) {
			if (pinned && entryHoverKey(pinned.properties) !== entryHoverKey(feature.properties)) {
				pinned = null;
			}
			show(feature, options);
		},
		// Called when the pointer leaves a marker: fall back to the pinned popup
		// instead of closing outright.
		revertToPinned() {
			if (pinned) {
				show(pinned);
				return;
			}
			close();
		},
		clear() {
			pinned = null;
			close();
		}
	};
}

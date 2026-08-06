/**
 * Shared hover state coupling the entry list and the map markers: hovering a
 * list card highlights the matching marker and vice versa. The `source` records
 * where the hover originated so the list only auto-scrolls a card into view when
 * the hover came from the map (not when the pointer is already on the card).
 *
 * Safe as a module-level singleton because the app is fully client-side
 * (`router.type: 'hash'`), so there is no SSR request state to leak.
 */
import type { EntryProperties } from '$lib/types/entries';

export type HoverSource = 'list' | 'map';

/** Stable, type-scoped key — entry ids are only unique within a type. */
export function entryHoverKey(props: Pick<EntryProperties, 'type' | 'id'>): string {
	return `${props.type}:${props.id}`;
}

class HoveredEntryStore {
	key = $state<string | null>(null);
	source = $state<HoverSource | null>(null);

	setHover(props: Pick<EntryProperties, 'type' | 'id'>, source: HoverSource) {
		this.key = entryHoverKey(props);
		this.source = source;
	}

	/** Clears the hover; optionally only if `props` still owns it (avoids races). */
	clear(props?: Pick<EntryProperties, 'type' | 'id'>) {
		if (props && this.key !== entryHoverKey(props)) {
			return;
		}
		this.key = null;
		this.source = null;
	}
}

export const hoveredEntry = new HoveredEntryStore();

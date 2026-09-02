import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { getAssociatedFarmIdForDepot } from '$lib/api/entry-details';
import type { EntryFeature, EntryFeatureCollection, MainEntryFeature } from '$lib/types/entries';
import { mainEntryTypeToResource } from '$lib/utils/main-entries';
import { routeBuilders } from '$lib/utils/routes';

export interface EntrySelectionSources {
	entries: () => EntryFeatureCollection | undefined;
	isMyEntriesScope: () => boolean;
	focusedEntry: () => MainEntryFeature | undefined;
	onEntryClick?: (feature: EntryFeature, options?: { openPopup?: boolean }) => void;
}

export interface EntrySelection {
	listScrollEl: HTMLElement | null;
	handleEntryClick(feature: EntryFeature, options?: { triggerPan?: boolean }): Promise<void>;
	/** Ask for the captured list scroll to be re-applied once the list remounts ("back"). */
	requestScrollRestore(): void;
}

/**
 * Clicking an entry: the depot → associated-farm resolution with its
 * interaction-race guard, the pan dedupe against the detail route, and the list
 * scroll capture/restore across the detail round-trip. Must be called during
 * component initialization (it registers `$effect`s).
 */
export function createEntrySelection(sources: EntrySelectionSources): EntrySelection {
	// Read only inside `handleEntryClick`, never by a template, so plain closure
	// state rather than a rune (matching `createEntryActions`' pending flags).
	let latestInteractionId = 0;
	let lastDetailId = $state<string | null>(null);
	// List scroll restore (F12.3): captured when a detail opens, re-applied when
	// the list remounts after a "back". The list content is unmounted while a
	// detail is open, so scrollTop would otherwise be lost.
	let listScrollEl = $state<HTMLElement | null>(null);
	let savedListScrollTop = $state(0);
	let pendingScrollRestore = $state(false);

	$effect(() => {
		const focusedEntry = sources.focusedEntry();
		if (focusedEntry && focusedEntry.properties.id !== lastDetailId) {
			// Pan from resolved detail data (works for deep-link and redirect loads, too).
			sources.onEntryClick?.(focusedEntry, { openPopup: true });
			lastDetailId = focusedEntry.properties.id;
		} else if (!focusedEntry) {
			lastDetailId = null;
		}
	});

	// Re-apply the captured list scroll once the list content remounts after a
	// "back". Runs when both the restore is pending and the element is bound.
	$effect(() => {
		if (pendingScrollRestore && listScrollEl) {
			listScrollEl.scrollTop = savedListScrollTop;
			pendingScrollRestore = false;
		}
	});

	async function handleEntryClick(feature: EntryFeature, options: { triggerPan?: boolean } = {}) {
		const interactionId = ++latestInteractionId;
		const props = feature.properties;

		// Remember where the list was scrolled so "back" can restore it (F12.3).
		savedListScrollTop = listScrollEl?.scrollTop ?? 0;

		if (sources.isMyEntriesScope()) {
			if (options.triggerPan !== false) {
				sources.onEntryClick?.(feature, { openPopup: true });
			}
			return;
		}

		if (props.type === 'Depot') {
			try {
				const farmId = await getAssociatedFarmIdForDepot(props.id);
				// Ignore stale async results when a newer interaction has happened.
				if (interactionId !== latestInteractionId) {
					return;
				}

				if (farmId) {
					const associatedFarmFeature = sources
						.entries()
						?.features.find(
							(candidate) =>
								candidate.properties?.type === 'Farm' && candidate.properties?.id === farmId
						);

					if (associatedFarmFeature) {
						// Only pan to the farm on first selection; skip if its network is already open.
						if (sources.focusedEntry()?.properties.id !== farmId) {
							sources.onEntryClick?.(associatedFarmFeature as EntryFeature, { openPopup: true });
						} else {
							sources.onEntryClick?.(feature, { openPopup: true });
						}
						lastDetailId = farmId;
					}
					await goto(routeBuilders.farm.detail(farmId));
					return;
				}

				if (dev) {
					console.warn(`No associated farm found for depot ${props.id}`);
				}
			} catch (error) {
				if (dev) {
					console.warn(`Failed to resolve associated farm for depot ${props.id}`, error);
				}
			}
			return;
		}

		// Trigger map click handler (for panning/popup) when requested.
		if (options.triggerPan !== false) {
			sources.onEntryClick?.(feature, { openPopup: true });
		}

		// Prevent duplicate panning when route data for this same entry arrives.
		lastDetailId = props.id;

		// Navigate to detail route for farm/initiative.
		const mainEntryResource = mainEntryTypeToResource(props.type);
		await goto(routeBuilders.mainEntryDetail(mainEntryResource, props.id));
	}

	return {
		get listScrollEl() {
			return listScrollEl;
		},
		set listScrollEl(next: HTMLElement | null) {
			listScrollEl = next;
		},
		handleEntryClick,
		requestScrollRestore() {
			if (savedListScrollTop > 0) {
				pendingScrollRestore = true;
			}
		}
	};
}

import type { EntryEditorMode } from '$lib/types/editor';
import type { MainEntryFeature } from '$lib/types/entries';
import { routeBuilders } from '$lib/utils/routes';

/**
 * Where the sidebar's task levels (editors, profile actions) lead. Kept as pure
 * route lookups so the "where does this return to" rules are testable apart
 * from navigation.
 */

export function entryEditRoute(entry: MainEntryFeature): string {
	return entry.properties.type === 'Farm'
		? routeBuilders.farm.edit(entry.properties.id)
		: routeBuilders.initiative.edit(entry.properties.id);
}

/** Cancelling a new entry returns to my entries; cancelling an edit to its profile. */
export function entryEditorCancelRoute(
	mode: EntryEditorMode,
	entry: MainEntryFeature | undefined
): string {
	if (mode === 'create') {
		return routeBuilders.myEntries();
	}
	if (entry) {
		return routeBuilders.entryDetail(entry.properties.type, entry.properties.id);
	}
	return routeBuilders.home();
}

/** A depot editor opened from a farm profile returns there, otherwise to my entries. */
export function depotEditorReturnRoute(returnFarmId: string | null): string {
	return returnFarmId ? routeBuilders.farm.detail(returnFarmId) : routeBuilders.myEntries();
}

/** Editing a depot from a farm profile keeps that farm as the return target. */
export function depotEditRoute(depotId: string, farmId: string | undefined): string {
	return farmId
		? routeBuilders.depot.editForFarm(depotId, farmId)
		: routeBuilders.depotLegacy.edit(depotId);
}

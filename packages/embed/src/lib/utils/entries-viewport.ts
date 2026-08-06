import type { EntryFeatureCollection, EntryType } from '$lib/types/entries';

function isMainEntryType(type: EntryType | undefined): boolean {
	return type === 'Farm' || type === 'Initiative';
}

/**
 * Filters entries for sidebar display:
 * - keep only farms/initiatives
 * - optionally constrain to current viewport through `containsCoordinate`
 */
export function filterSidebarEntriesByViewport(
	entries: EntryFeatureCollection,
	containsCoordinate?: (coordinate: [number, number]) => boolean
): EntryFeatureCollection {
	return {
		...entries,
		features: entries.features.filter((feature) => {
			if (!isMainEntryType(feature.properties?.type)) {
				return false;
			}

			if (!containsCoordinate) {
				return true;
			}

			return containsCoordinate(feature.geometry.coordinates as [number, number]);
		})
	};
}

import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
import type { EntryFeature, EntryType } from '$lib/types/entries';

const ENTRY_TYPES = new Set<EntryType>(['Farm', 'Initiative', 'Depot']);

/**
 * Narrows a generic GeoJSON feature handed back by svelte-maplibre callbacks
 * (CircleLayer `onclick`, MarkerLayer snippets) to our discriminated
 * {@link EntryFeature}, validating the `properties.type` discriminant and the
 * Point geometry.
 *
 * Returns `undefined` for cluster features (which carry `cluster`/`point_count`
 * instead of an entry `type`) and anything else unexpected, so callers can
 * branch instead of casting with `as`.
 */
export function asEntryFeature(
	feature: Feature<Geometry, GeoJsonProperties> | null | undefined
): EntryFeature | undefined {
	const type = feature?.properties?.type;
	if (
		feature?.geometry?.type === 'Point' &&
		typeof type === 'string' &&
		ENTRY_TYPES.has(type as EntryType)
	) {
		return feature as EntryFeature;
	}
	return undefined;
}

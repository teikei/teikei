import type { EntryFeatureCollection } from '$lib/types/entries';

export interface OwnedEntryIds {
	mainEntries: ReadonlySet<string>;
	depots: ReadonlySet<string>;
	farms: ReadonlySet<string>;
}

/** Groups the ids of the signed-in user's own entries the three ways the sidebar reads them. */
export function deriveOwnedEntryIds(features: EntryFeatureCollection['features']): OwnedEntryIds {
	const mainEntries = new Set<string>();
	const depots = new Set<string>();
	const farms = new Set<string>();

	for (const feature of features) {
		// `properties` is non-optional in the type but guarded anyway, as the three
		// derivations this replaces did: a malformed feature is skipped, not thrown on.
		const type = feature.properties?.type;
		if (!type) {
			continue;
		}
		const { id } = feature.properties;
		if (type === 'Farm' || type === 'Initiative') {
			mainEntries.add(id);
		}
		if (type === 'Farm') {
			farms.add(id);
		}
		if (type === 'Depot') {
			depots.add(id);
		}
	}

	return { mainEntries, depots, farms };
}

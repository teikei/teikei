import type { DepotFeature, FarmFeatureCollection, MainEntryFeature } from '$lib/types/entries';
import type { MainEntryResource } from '$lib/utils/main-entries';
import { apiFetch } from '$lib/api/client';

export async function getMainEntry(
	resource: MainEntryResource,
	id: string
): Promise<MainEntryFeature> {
	return apiFetch<MainEntryFeature>(`${resource}/${encodeURIComponent(id)}`, {
		auth: 'optional',
		errorMessage: `Failed to fetch ${resource} with id ${id}`
	});
}

export async function getDepotEntry(id: string): Promise<DepotFeature> {
	return apiFetch<DepotFeature>(`depots/${encodeURIComponent(id)}`, {
		auth: 'optional',
		errorMessage: `Failed to fetch depot with id ${id}`
	});
}

function extractAssociatedFarmId(farms: FarmFeatureCollection | undefined): string | null {
	const firstFarm = farms?.features?.[0];
	return firstFarm?.properties?.id ?? null;
}

/**
 * Reads the associated farm id for a legacy depot detail URL.
 * Returns null when no association can be resolved.
 *
 * Always performs an unauthenticated request: this public association lookup
 * must succeed for logged-out visitors, and sending a stale or invalid access
 * token would make the API reject the request before authorizing it.
 */
export async function getAssociatedFarmIdForDepot(depotId: string): Promise<string | null> {
	try {
		const depot = await apiFetch<DepotFeature>(`depots/${encodeURIComponent(depotId)}`, {
			auth: 'none',
			errorMessage: `Failed to fetch depot with id ${depotId}`
		});
		return extractAssociatedFarmId(depot.properties?.farms);
	} catch {
		return null;
	}
}

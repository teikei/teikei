import config from '$lib/config/app-configuration';
import type { DepotFeature, FarmFeatureCollection, MainEntryFeature } from '$lib/types/entries';
import { getAccessToken } from '$lib/utils/localStorage';

const { apiBaseUrl } = config;

export type PlaceType = 'farms' | 'initiatives';

function getAuthenticatedRequestOptions(): RequestInit | undefined {
	const accessToken = getAccessToken();
	if (!accessToken) {
		return undefined;
	}

	return {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	};
}

export async function getPlace(type: PlaceType, id: string): Promise<MainEntryFeature> {
	const response = await fetch(
		`${apiBaseUrl}/${type}/${encodeURIComponent(id)}`,
		getAuthenticatedRequestOptions()
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${type} with id ${id}`);
	}
	return response.json();
}

export async function getDepot(id: string): Promise<DepotFeature> {
	const response = await fetch(
		`${apiBaseUrl}/depots/${encodeURIComponent(id)}`,
		getAuthenticatedRequestOptions()
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch depot with id ${id}`);
	}
	return response.json() as Promise<DepotFeature>;
}

function extractFarmIdFromFarmAssociations(
	farms: FarmFeatureCollection | undefined
): string | null {
	const firstFarm = farms?.features?.[0];
	return firstFarm?.properties?.id ?? null;
}

/**
 * Reads the associated farm id for a legacy depot detail URL.
 * Returns null when no association can be resolved.
 */
export async function getDepotAssociatedFarmId(depotId: string): Promise<string | null> {
	const response = await fetch(`${apiBaseUrl}/depots/${encodeURIComponent(depotId)}`);
	if (!response.ok) {
		return null;
	}

	const depot = (await response.json()) as DepotFeature;
	return extractFarmIdFromFarmAssociations(depot.properties?.farms);
}

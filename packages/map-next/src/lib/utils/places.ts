import config from '$lib/config/app-configuration';
import type {
	DepotFeature,
	FarmFeatureCollection,
	MainEntryFeature,
	MainEntryType
} from '$lib/types/entries';

const { apiBaseUrl } = config;

export type PlaceType = 'farms' | 'initiatives';

export function entryTypeToPlaceType(type: MainEntryType): PlaceType {
	return `${type.toLowerCase()}s` as PlaceType;
}

export async function getPlace(type: PlaceType, id: string): Promise<MainEntryFeature> {
	const response = await fetch(`${apiBaseUrl}/${type}/${id}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${type} with id ${id}`);
	}
	return response.json();
}

export async function getDepot(id: string): Promise<DepotFeature> {
	const response = await fetch(`${apiBaseUrl}/depots/${encodeURIComponent(id)}`);
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

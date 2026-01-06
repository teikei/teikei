import config from '$lib/config/app-configuration';
import type { PlaceDetailFeature } from '$lib/types/place-details';

const { apiBaseUrl } = config;

export type PlaceType = 'farms' | 'initiatives';

export function entryTypeToPlaceType(type: 'Farm' | 'Initiative'): PlaceType {
	return `${type.toLowerCase()}s` as PlaceType;
}

export async function getPlace(type: PlaceType, id: string): Promise<PlaceDetailFeature> {
	const response = await fetch(`${apiBaseUrl}/${type}/${id}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${type} with id ${id}`);
	}
	return response.json();
}

import config from '$lib/config/app-configuration';

const { apiBaseUrl } = config;

export type AutocompleteSuggestionType = 'farm' | 'initiative' | 'depot' | 'location';

export interface AutocompleteSuggestion {
	id: string;
	title: string;
	type: AutocompleteSuggestionType;
	position?: {
		lat: number;
		lng: number;
	};
}

interface GetAutocompleteSuggestionsParams {
	text: string;
	locale?: string;
	withEntries?: boolean;
}

export interface GeocoderLocationResponse {
	id: string;
	street?: string;
	houseNumber?: string | null;
	postalCode?: string;
	city?: string;
	state?: string;
	country?: string;
	longitude: number;
	latitude: number;
}

export async function getAutocompleteSuggestions(
	params: GetAutocompleteSuggestionsParams
): Promise<AutocompleteSuggestion[]> {
	const query = new URLSearchParams();
	if (params.withEntries) {
		query.set('entries', 'true');
	}

	const response = await fetch(`${apiBaseUrl}/autocomplete?${query.toString()}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			text: params.text,
			locale: params.locale
		})
	});

	if (!response.ok) {
		throw new Error('Failed to fetch autocomplete suggestions');
	}

	return response.json();
}

export async function geocodeLocationId(locationId: string): Promise<GeocoderLocationResponse> {
	const response = await fetch(`${apiBaseUrl}/geocoder`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			locationid: locationId
		})
	});

	if (!response.ok) {
		throw new Error('Failed to geocode location');
	}

	return response.json();
}

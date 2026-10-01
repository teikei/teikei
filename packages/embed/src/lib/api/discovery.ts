import { apiFetch } from '$lib/api/client';

export type AutocompleteSuggestionType = 'farm' | 'initiative' | 'depot' | 'location';

export interface AutocompleteSuggestion {
	id: string;
	title: string;
	type: AutocompleteSuggestionType;
	position?: {
		lat: number;
		lng: number;
	};
	/** Only set for regions (e.g. Bundesland, Kanton); absent for cities and addresses. */
	administrativeAreaType?: 'country' | 'state' | 'county';
	countryCode?: string;
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

	return apiFetch<AutocompleteSuggestion[]>(`autocomplete?${query.toString()}`, {
		method: 'POST',
		body: {
			text: params.text,
			locale: params.locale
		},
		errorMessage: 'Failed to fetch autocomplete suggestions'
	});
}

export async function geocodeLocationId(locationId: string): Promise<GeocoderLocationResponse> {
	return apiFetch<GeocoderLocationResponse>('geocoder', {
		method: 'POST',
		body: {
			locationid: locationId
		},
		errorMessage: 'Failed to geocode location'
	});
}

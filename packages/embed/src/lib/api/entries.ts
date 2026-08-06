import type { EntryFeatureCollection } from '$lib/types/entries';
import { getAccessToken } from '$lib/utils/localStorage';
import { apiFetch } from '$lib/api/client';

export type GetEntriesParams = undefined;

export type GetEntriesResponse = EntryFeatureCollection;

export async function getEntries(): Promise<GetEntriesResponse> {
	return apiFetch<GetEntriesResponse>('entries', {
		errorMessage: 'Failed to fetch entries'
	});
}

export async function getMyEntries(): Promise<GetEntriesResponse> {
	if (!getAccessToken()) {
		return {
			type: 'FeatureCollection',
			features: []
		};
	}

	return apiFetch<GetEntriesResponse>('entries?mine=true', {
		auth: 'required',
		errorMessage: 'Failed to fetch my entries'
	});
}

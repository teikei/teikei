import config from '$lib/config/app-configuration';
import type { EntryFeatureCollection } from '$lib/types/entries';
import { getAccessToken } from '$lib/utils/localStorage';

const { apiBaseUrl } = config;

export type GetEntriesParams = undefined;

export type GetEntriesResponse = EntryFeatureCollection;

export async function getEntries(): Promise<GetEntriesResponse> {
	const response = await fetch(`${apiBaseUrl}/entries`);
	if (!response.ok) {
		throw new Error('Failed to fetch entries');
	}
	return response.json();
}

export async function getMyEntries(): Promise<GetEntriesResponse> {
	const accessToken = getAccessToken();
	if (!accessToken) {
		return {
			type: 'FeatureCollection',
			features: []
		};
	}

	const response = await fetch(`${apiBaseUrl}/entries?mine=true`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new Error('Failed to fetch my entries');
	}

	return response.json();
}

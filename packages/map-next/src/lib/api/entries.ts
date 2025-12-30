import config from '$lib/config/app-configuration';
import type { EntryFeatureCollection } from '$lib/types/entries';

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

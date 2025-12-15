import config from '$lib/config/app-configuration';
import type { GetEntriesResponse } from '$lib/types/api';

const { apiBaseUrl } = config;

export async function getEntries(): Promise<GetEntriesResponse> {
	const response = await fetch(`${apiBaseUrl}/entries`);
	if (!response.ok) {
		throw new Error('Failed to fetch entries');
	}
	return response.json();
}

import config from '$lib/config/app-configuration';
import type { FeatureCollection, Point } from 'geojson';
import type { EntryFeature, EntryProperties } from '$lib/types/entries';

const { apiBaseUrl } = config;

export interface GetEntriesResponse extends FeatureCollection<Point, EntryProperties> {
	type: 'FeatureCollection';
	features: EntryFeature[];
}

export async function getEntries(): Promise<GetEntriesResponse> {
	const response = await fetch(`${apiBaseUrl}/entries`);
	if (!response.ok) {
		throw new Error('Failed to fetch entries');
	}
	return response.json();
}

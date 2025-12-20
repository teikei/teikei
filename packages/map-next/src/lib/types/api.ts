import type { FeatureCollection, Point } from 'geojson';
import type { EntryFeature, EntryProperties } from './entries';

export interface GetEntriesResponse extends FeatureCollection<Point, EntryProperties> {
	type: 'FeatureCollection';
	features: EntryFeature[];
}

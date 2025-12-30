import type { Feature, FeatureCollection, Point } from 'geojson';

export interface Product {
	id: string;
	category: string;
	name: string;
	type: 'Product';
	link: string;
}

export interface Goal {
	id: string;
	name: string;
	type: 'Goal';
	link: string;
}

interface BaseEntryProperties {
	id: string;
	name: string;
	postalcode: string;
	city: string;
	state: string;
	country: string;
	link: string;
}

export interface FarmProperties extends BaseEntryProperties {
	type: 'Farm';
	products: Product[];
}

export interface DepotProperties extends BaseEntryProperties {
	type: 'Depot';
}

export interface InitiativeProperties extends BaseEntryProperties {
	type: 'Initiative';
	goals: Goal[];
}

export type EntryProperties = FarmProperties | DepotProperties | InitiativeProperties;

export type EntryType = 'Farm' | 'Depot' | 'Initiative';

export interface EntryFeature extends Feature<Point, EntryProperties> {
	type: 'Feature';
	geometry: Point;
	properties: EntryProperties;
}

export interface EntryFeatureCollection extends FeatureCollection<Point, EntryProperties> {
	type: 'FeatureCollection';
	features: EntryFeature[];
}

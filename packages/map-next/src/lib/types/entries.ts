import type { Feature, FeatureCollection, Point } from 'geojson';

export type AcceptsNewMembers = 'yes' | 'no' | 'waitlist';

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

export interface Badge {
	id: string;
	name: string;
	category: 'associations' | 'certifications';
	url: string;
	logo: string;
	type: 'Badge';
	link: string;
}

export type MainEntryType = 'Farm' | 'Initiative';
export type EntryType = MainEntryType | 'Depot';

interface BaseEntryProperties {
	id: string;
	name: string;
	postalcode: string;
	address?: string;
	street?: string;
	housenumber?: string | null;
	city: string;
	state: string;
	country: string;
	link: string;
	url?: string | null;
	description?: string | null;
	acceptsNewMembers?: AcceptsNewMembers;
	foundedAtYear?: number | null;
	foundedAtMonth?: number | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface FarmProperties extends BaseEntryProperties {
	type: 'Farm';
	products: Product[];
	depots?: FeatureCollection<Point, DepotProperties>;
	badges?: Badge[] | null;
	maximumMembers?: number | null;
	additionalProductInformation?: string;
	participation?: string;
	actsEcological?: boolean;
	economicalBehavior?: string;
}

export interface DepotProperties extends BaseEntryProperties {
	type: 'Depot';
	deliveryDays?: string | null;
	farms?: FeatureCollection<Point, FarmProperties>;
}

export interface InitiativeProperties extends BaseEntryProperties {
	type: 'Initiative';
	goals: Goal[];
	badges?: Badge[] | null;
}

export type MainEntryProperties = FarmProperties | InitiativeProperties;
export type EntryProperties = MainEntryProperties | DepotProperties;

export interface FarmFeature extends Feature<Point, FarmProperties> {
	type: 'Feature';
	geometry: Point;
	properties: FarmProperties;
}

export interface DepotFeature extends Feature<Point, DepotProperties> {
	type: 'Feature';
	geometry: Point;
	properties: DepotProperties;
}

export interface InitiativeFeature extends Feature<Point, InitiativeProperties> {
	type: 'Feature';
	geometry: Point;
	properties: InitiativeProperties;
}

export type FarmFeatureCollection = FeatureCollection<Point, FarmProperties>;
export type DepotFeatureCollection = FeatureCollection<Point, DepotProperties>;
export type InitiativeFeatureCollection = FeatureCollection<Point, InitiativeProperties>;

export type MainEntryFeature = FarmFeature | InitiativeFeature;
export type MainEntryFeatureCollection = FarmFeatureCollection | InitiativeFeatureCollection;

export type EntryFeature = MainEntryFeature | DepotFeature;
export type EntryFeatureCollection = FeatureCollection<Point, EntryProperties>;

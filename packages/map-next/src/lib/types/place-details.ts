import type { Feature, FeatureCollection, Point } from 'geojson';

export interface Badge {
	id: string;
	name: string;
	category: 'associations' | 'certifications';
	logo: string;
	url: string;
}

export interface Goal {
	id: string;
	name: string;
}

export interface Product {
	id: string;
	name: string;
	category: string;
}

export type AcceptsNewMembers = 'yes' | 'no' | 'waitlist';

interface BasePlaceDetailProperties {
	id: string;
	name: string;
	city: string;
	postalcode?: string;
	state?: string;
	country?: string;
	link: string;
	url?: string;
	description: string;
	foundedAtYear?: number;
	foundedAtMonth?: number;
	acceptsNewMembers?: AcceptsNewMembers;
	badges: Badge[];
	createdAt: string;
	updatedAt: string;
}

export interface FarmDetailProperties extends BasePlaceDetailProperties {
	type: 'Farm';
	products: Product[];
	depots?: FeatureCollection;
	additionalProductInformation?: string;
	actsEcological?: boolean;
	economicalBehavior?: string;
	participation?: string;
	maximumMembers?: number;
}

export interface InitiativeDetailProperties extends BasePlaceDetailProperties {
	type: 'Initiative';
	goals: Goal[];
}

export type PlaceDetailProperties = FarmDetailProperties | InitiativeDetailProperties;

export interface PlaceDetailFeature extends Feature<Point, PlaceDetailProperties> {
	type: 'Feature';
	geometry: Point;
	properties: PlaceDetailProperties;
}

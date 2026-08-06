import type {
	Badge,
	DepotFeature,
	DepotProperties,
	FarmFeature,
	FarmProperties,
	InitiativeProperties
} from '$lib/types/entries';

export const storyAssociationBadge: Badge = {
	id: 'badge-association',
	name: 'CSA Network',
	category: 'associations',
	url: 'https://example.org/csa-network',
	logo: '',
	type: 'Badge',
	link: '/badges/badge-association'
};

export const storyCertificationBadge: Badge = {
	id: 'badge-certification',
	name: 'Organic certified',
	category: 'certifications',
	url: '',
	logo: '',
	type: 'Badge',
	link: '/badges/badge-certification'
};

export const storyDepotProperties: DepotProperties = {
	id: 'depot-weekly-market',
	type: 'Depot',
	name: 'Weekly Market Depot',
	postalcode: '10997',
	city: 'Berlin',
	state: 'Berlin',
	country: 'Germany',
	link: '/depots/depot-weekly-market',
	url: 'https://example.org/depot',
	deliveryDays: 'Friday afternoon'
};

export const storyDepotFeature: DepotFeature = {
	type: 'Feature',
	geometry: {
		type: 'Point',
		coordinates: [13.43, 52.5]
	},
	properties: storyDepotProperties
};

export const storyFarmProperties: FarmProperties = {
	id: 'farm-example',
	type: 'Farm',
	name: 'Example Farm Cooperative',
	postalcode: '17268',
	city: 'Templin',
	state: 'Brandenburg',
	country: 'Germany',
	link: '/farms/farm-example',
	url: 'https://example.org/farm',
	description: 'A cooperative farm with weekly vegetable shares and member work days.',
	products: [
		{
			id: 'product-vegetables',
			category: 'vegetables',
			name: 'vegetables',
			type: 'Product',
			link: '/products/product-vegetables'
		},
		{
			id: 'product-fruit',
			category: 'fruit',
			name: 'fruit',
			type: 'Product',
			link: '/products/product-fruit'
		}
	],
	depots: {
		type: 'FeatureCollection',
		features: [storyDepotFeature]
	},
	badges: [storyAssociationBadge, storyCertificationBadge],
	maximumMembers: 180,
	additionalProductInformation: 'Shares include seasonal vegetables, herbs, and occasional fruit.',
	participation: 'Members can join field days and help with harvest logistics.',
	actsEcological: true,
	economicalBehavior: 'Prices are set transparently in an annual member assembly.'
};

export const storyFarmFeature: FarmFeature = {
	type: 'Feature',
	geometry: {
		type: 'Point',
		coordinates: [13.51, 53.12]
	},
	properties: storyFarmProperties
};

export const storyInitiativeProperties: InitiativeProperties = {
	id: 'initiative-food-policy',
	type: 'Initiative',
	name: 'Regional Food Policy Council',
	postalcode: '04109',
	city: 'Leipzig',
	state: 'Saxony',
	country: 'Germany',
	link: '/initiatives/initiative-food-policy',
	url: 'https://example.org/initiative',
	description: 'A local initiative connecting producers, eaters, and civic groups.',
	goals: [
		{
			id: 'goal-networking',
			name: 'networking',
			type: 'Goal',
			link: '/goals/goal-networking'
		},
		{
			id: 'goal-education',
			name: 'education',
			type: 'Goal',
			link: '/goals/goal-education'
		}
	],
	badges: [storyAssociationBadge]
};

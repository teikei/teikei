import { describe, expect, it } from 'vitest';
import { filterSidebarEntriesByViewport } from './entries-viewport';
import type { EntryFeatureCollection } from '$lib/types/entries';

const entries: EntryFeatureCollection = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [10, 50] },
			properties: {
				id: 'farm-1',
				type: 'Farm',
				name: 'Farm One',
				postalcode: '00000',
				city: 'City',
				state: 'State',
				country: 'DE',
				link: 'https://example.com',
				products: []
			}
		},
		{
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [11, 50] },
			properties: {
				id: 'initiative-1',
				type: 'Initiative',
				name: 'Initiative One',
				postalcode: '00000',
				city: 'City',
				state: 'State',
				country: 'DE',
				link: 'https://example.com',
				goals: []
			}
		},
		{
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [12, 50] },
			properties: {
				id: 'depot-1',
				type: 'Depot',
				name: 'Depot One',
				postalcode: '00000',
				city: 'City',
				state: 'State',
				country: 'DE',
				link: 'https://example.com'
			}
		}
	]
};

describe('filterSidebarEntriesByViewport', () => {
	it('keeps only farm/initiative entries when no viewport predicate is provided', () => {
		const result = filterSidebarEntriesByViewport(entries);

		expect(result.features).toHaveLength(2);
		expect(result.features.map((feature) => feature.properties.id)).toEqual([
			'farm-1',
			'initiative-1'
		]);
	});

	it('applies viewport predicate in addition to main-entry filtering', () => {
		const result = filterSidebarEntriesByViewport(entries, ([lng]) => lng >= 10.5 && lng <= 11.5);

		expect(result.features).toHaveLength(1);
		expect(result.features[0]?.properties.id).toBe('initiative-1');
	});
});

import { describe, expect, it } from 'vitest';
import type { EntryFeature } from '$lib/types/entries';
import { buildEntryFlyToOptions, getSidebarFocusOffset } from './map-focus';

const farmFeature: EntryFeature = {
	type: 'Feature',
	geometry: { type: 'Point', coordinates: [8.54, 47.37] },
	properties: {
		id: 'farm-1',
		type: 'Farm',
		name: 'Farm One',
		postalcode: '8000',
		city: 'Zurich',
		state: 'ZH',
		country: 'CH',
		link: 'https://example.com',
		products: []
	}
};

describe('buildEntryFlyToOptions', () => {
	it('uses entry coordinates with sidebar-aware default offset and minimum zoom', () => {
		const flyTo = buildEntryFlyToOptions(farmFeature, 4);

		expect(flyTo.center).toEqual([8.54, 47.37]);
		expect(flyTo.zoom).toBe(10);
		expect(flyTo.offset).toEqual([250, 0]);
		expect(flyTo.duration).toBe(1000);
	});

	it('keeps current zoom when already above the minimum zoom', () => {
		const flyTo = buildEntryFlyToOptions(farmFeature, 12);

		expect(flyTo.zoom).toBe(12);
	});

	it('applies explicit focus options overrides', () => {
		const flyTo = buildEntryFlyToOptions(farmFeature, 8, {
			offset: [100, 20],
			minZoom: 7,
			duration: 250
		});

		expect(flyTo.offset).toEqual([100, 20]);
		expect(flyTo.zoom).toBe(8);
		expect(flyTo.duration).toBe(250);
	});
});

describe('getSidebarFocusOffset', () => {
	it('shifts the point right of the left sidebar on desktop', () => {
		expect(
			getSidebarFocusOffset({ isMobile: false, viewportHeight: 900, sidebarWidth: 500 })
		).toEqual([250, 0]);
	});

	it('lifts the point into the upper-half centre on mobile', () => {
		// Bottom sheet covers the lower half; target sits a quarter viewport above centre.
		expect(getSidebarFocusOffset({ isMobile: true, viewportHeight: 844 })).toEqual([0, -211]);
	});

	it('does not shift horizontally on mobile so the point stays centred', () => {
		const [x] = getSidebarFocusOffset({ isMobile: true, viewportHeight: 800 });
		expect(x).toBe(0);
	});
});

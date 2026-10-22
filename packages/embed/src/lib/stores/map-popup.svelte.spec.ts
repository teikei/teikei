import { describe, expect, it } from 'vitest';
import type { EntryFeature } from '$lib/types/entries';
import { createMapPopup } from './map-popup.svelte';

const address = { postalcode: '', city: '', state: '', country: '', link: '' };

function farm(id: string): EntryFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [0, 0] },
		properties: { id, name: id, type: 'Farm', products: [], ...address }
	};
}

function depot(id: string): EntryFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [0, 0] },
		properties: { id, name: id, type: 'Depot', ...address }
	};
}

describe('createMapPopup', () => {
	it('closes a hovered popup when the pointer leaves', () => {
		const popup = createMapPopup();
		popup.hover(farm('a'), { offset: [4, 2] });
		expect(popup.entry?.options?.offset).toEqual([4, 2]);
		expect(popup.isOpen).toBe(true);

		popup.revertToPinned();
		expect(popup.entry).toBeNull();
		expect(popup.isOpen).toBe(false);
	});

	it('returns to the pinned entry after hovering another marker and leaving it', () => {
		const popup = createMapPopup();
		popup.pin(farm('a'));
		popup.hover(farm('a'));
		popup.revertToPinned();
		expect(popup.entry?.feature.properties.id).toBe('a');
		expect(popup.isOpen).toBe(true);
	});

	it('breaks the pin when a different marker is hovered', () => {
		const popup = createMapPopup();
		popup.pin(farm('a'));
		popup.hover(farm('b'));
		expect(popup.entry?.feature.properties.id).toBe('b');

		popup.revertToPinned();
		expect(popup.entry).toBeNull();
	});

	it('does not confuse entries of different types sharing an id', () => {
		const popup = createMapPopup();
		popup.pin(farm('1'));
		popup.hover(depot('1'));
		popup.revertToPinned();
		expect(popup.entry).toBeNull();
	});

	it('exposes the hovered depot id only while a depot popup is shown', () => {
		const popup = createMapPopup();
		popup.hover(depot('d1'));
		expect(popup.hoveredDepotId).toBe('d1');

		popup.hover(farm('a'));
		expect(popup.hoveredDepotId).toBeNull();

		popup.pin(depot('d2'));
		popup.clear();
		expect(popup.hoveredDepotId).toBeNull();
		expect(popup.isOpen).toBe(false);
	});
});

import { describe, expect, it } from 'vitest';
import type { MainEntryFeature } from '$lib/types/entries';
import { routeBuilders } from './routes';
import {
	depotEditorReturnRoute,
	depotEditRoute,
	entryEditorCancelRoute,
	entryEditRoute
} from './sidebar-navigation';

const address = { postalcode: '', city: '', state: '', country: '', link: '' };

function initiative(id: string): MainEntryFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [0, 0] },
		properties: { id, name: id, type: 'Initiative', goals: [], ...address }
	} as MainEntryFeature;
}

describe('sidebar navigation', () => {
	it('edits and returns to the entry of the matching type', () => {
		expect(entryEditRoute(initiative('i1'))).toBe(routeBuilders.initiative.edit('i1'));
		expect(entryEditorCancelRoute('edit', initiative('i1'))).toBe(
			routeBuilders.initiative.detail('i1')
		);
	});

	it('returns from creating an entry to my entries', () => {
		expect(entryEditorCancelRoute('create', initiative('i1'))).toBe(routeBuilders.myEntries());
	});

	it('keeps the originating farm as the depot editor return target', () => {
		expect(depotEditRoute('d1', 'f1')).toBe(routeBuilders.depot.editForFarm('d1', 'f1'));
		expect(depotEditRoute('d1', undefined)).toBe(routeBuilders.depotLegacy.edit('d1'));
		expect(depotEditorReturnRoute('f1')).toBe(routeBuilders.farm.detail('f1'));
		expect(depotEditorReturnRoute(null)).toBe(routeBuilders.myEntries());
	});
});

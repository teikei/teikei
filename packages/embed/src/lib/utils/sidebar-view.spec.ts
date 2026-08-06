import { describe, expect, it } from 'vitest';
import { resolveSidebarView, type SidebarView, type SidebarViewInput } from './sidebar-view';
import type { DepotEditorData, EntryEditorData } from '$lib/types/editor';
import type { MainEntryFeature } from '$lib/types/entries';

const farmDetail: MainEntryFeature = {
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
		link: 'https://example.com/farm-1',
		products: []
	}
};

const initiativeDetail: MainEntryFeature = {
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
		link: 'https://example.com/initiative-1',
		goals: []
	}
};

const farmEditorData: EntryEditorData = {
	mode: 'edit',
	entryType: 'Farm',
	products: [],
	goals: [],
	badges: []
};

const initiativeEditorData: EntryEditorData = { ...farmEditorData, entryType: 'Initiative' };

const depotEditorData: DepotEditorData = { mode: 'edit', farmOptions: [], allFarmOptions: [] };

const LIST_VIEW: SidebarView = {
	showDetail: false,
	showContact: false,
	showEditor: false,
	showDepotEditor: false,
	isNonListMode: false,
	isEditorMode: false,
	isTaskLevel: false,
	isFarmEditor: false,
	isFarmDetail: false,
	isInitiativeEditor: false,
	isInitiativeDetail: false,
	isNavigatingToDataRoute: false,
	shellMode: 'list',
	focusedEntry: undefined
};

describe('resolveSidebarView', () => {
	const branches: [string, SidebarViewInput, Partial<SidebarView>][] = [
		[
			'depot editor',
			{ depotEditorData },
			{
				showDepotEditor: true,
				isNonListMode: true,
				isEditorMode: true,
				isTaskLevel: true,
				shellMode: 'editor'
			}
		],
		[
			'farm editor',
			{ editorData: farmEditorData, detailData: farmDetail },
			{
				showDetail: true,
				showEditor: true,
				isNonListMode: true,
				isEditorMode: true,
				isTaskLevel: true,
				isFarmEditor: true,
				shellMode: 'editor',
				focusedEntry: farmDetail
			}
		],
		[
			'initiative editor',
			{ editorData: initiativeEditorData, detailData: initiativeDetail },
			{
				showDetail: true,
				showEditor: true,
				isNonListMode: true,
				isEditorMode: true,
				isTaskLevel: true,
				isInitiativeEditor: true,
				shellMode: 'editor',
				focusedEntry: initiativeDetail
			}
		],
		[
			'contact',
			{ contactData: farmDetail },
			{
				showContact: true,
				isNonListMode: true,
				isTaskLevel: true,
				shellMode: 'task',
				focusedEntry: farmDetail
			}
		],
		[
			'farm detail',
			{ detailData: farmDetail },
			{
				showDetail: true,
				isNonListMode: true,
				isFarmDetail: true,
				shellMode: 'detail',
				focusedEntry: farmDetail
			}
		],
		[
			'initiative detail',
			{ detailData: initiativeDetail },
			{
				showDetail: true,
				isNonListMode: true,
				isInitiativeDetail: true,
				shellMode: 'detail',
				focusedEntry: initiativeDetail
			}
		],
		['list', {}, {}]
	];

	it.each(branches)('resolves the %s branch', (_name, input, expected) => {
		expect(resolveSidebarView(input)).toEqual({ ...LIST_VIEW, ...expected });
	});

	it('treats a failed load as detail so the shell expands', () => {
		const view = resolveSidebarView({ loadError: 'not-found' });

		expect(view.shellMode).toBe('detail');
		expect(view.isNonListMode).toBe(false);
	});

	it('flags navigation to a data route only for route ids that load remote data', () => {
		expect(resolveSidebarView({ navigatingToRouteId: '/farms/[id]' }).isNavigatingToDataRoute).toBe(
			true
		);
		expect(resolveSidebarView({ navigatingToRouteId: '/imprint' }).isNavigatingToDataRoute).toBe(
			false
		);
		expect(resolveSidebarView({}).isNavigatingToDataRoute).toBe(false);
	});

	it('prefers detail data over contact data as the focused entry', () => {
		expect(
			resolveSidebarView({ detailData: farmDetail, contactData: initiativeDetail }).focusedEntry
		).toBe(farmDetail);
		expect(resolveSidebarView({ contactData: initiativeDetail }).focusedEntry).toBe(
			initiativeDetail
		);
	});
});

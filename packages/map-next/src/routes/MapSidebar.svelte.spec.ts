import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import type { EntryFeatureCollection, MainEntryFeature } from '$lib/types/entries';

const gotoMock = vi.hoisted(() => vi.fn(async () => undefined));
const pageState = vi.hoisted(() => ({
	url: new URL('http://localhost/#/'),
	data: {} as Record<string, unknown>
}));

vi.mock('$app/navigation', () => ({
	goto: gotoMock
}));

vi.mock('$app/state', () => ({
	page: pageState
}));

import MapSidebar from './MapSidebar.svelte';

function createFarmDetail(id: string, name: string): MainEntryFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.54, 47.37] },
		properties: {
			id,
			type: 'Farm',
			name,
			postalcode: '8000',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			products: []
		}
	};
}

const emptyEntries: EntryFeatureCollection = {
	type: 'FeatureCollection',
	features: []
};

describe('MapSidebar', () => {
	it('triggers map pan callback for deep-link detail data even when list entries are empty', async () => {
		pageState.url = new URL('http://localhost/#/farms/farm-1');
		pageState.data = { detailData: createFarmDetail('farm-1', 'Farm One') };
		const onEntryClick = vi.fn();

		render(MapSidebar, {
			props: {
				entries: emptyEntries,
				onEntryClick
			}
		});

		await expect.poll(() => onEntryClick.mock.calls.length).toBe(1);
		expect(onEntryClick.mock.calls[0]?.[0]?.properties?.id).toBe('farm-1');
	});

	it('clicking a farm list row pans and navigates to the farm detail route', async () => {
		pageState.url = new URL('http://localhost/#/');
		pageState.data = {};
		gotoMock.mockReset();
		const onEntryClick = vi.fn();

		render(MapSidebar, {
			props: {
				entries: {
					type: 'FeatureCollection',
					features: [createFarmDetail('farm-2', 'Farm Two')]
				},
				onEntryClick
			}
		});

		const farmTextNode = Array.from(document.querySelectorAll('*')).find(
			(node) => node.textContent?.trim() === 'Farm Two'
		);
		const farmRow = farmTextNode?.closest('button');
		if (!(farmRow instanceof HTMLElement)) {
			throw new Error('Expected a clickable sidebar row for farm entry');
		}

		farmRow.click();

		await expect.poll(() => onEntryClick.mock.calls.length).toBe(1);
		await expect.poll(() => gotoMock.mock.calls.length).toBe(1);
		expect(gotoMock.mock.calls[0]?.[0]).toBe('#/farms/farm-2');
	});
});

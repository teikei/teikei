import { render } from 'vitest-browser-svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EntryFeatureCollection, MainEntryFeature } from '$lib/types/entries';

const gotoMock = vi.hoisted(() => vi.fn(async () => undefined));
const getDepotAssociatedFarmIdMock = vi.hoisted(() => vi.fn(async () => null));
const getCurrentUserMock = vi.hoisted(() =>
	vi.fn(() => ({
		id: 'user-1',
		name: 'Owner User',
		email: 'owner@example.com'
	}))
);
const isInitializedMock = vi.hoisted(() => vi.fn(() => true));
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

vi.mock('$lib/utils/places', () => ({
	entryTypeToPlaceType: (type: string) => `${type.toLowerCase()}s`,
	getDepotAssociatedFarmId: getDepotAssociatedFarmIdMock
}));

vi.mock('$lib/stores/auth.svelte', () => ({
	getCurrentUser: getCurrentUserMock,
	isInitialized: isInitializedMock
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

function createDepotFeature(id: string, name: string) {
	return {
		type: 'Feature' as const,
		geometry: { type: 'Point' as const, coordinates: [8.55, 47.38] },
		properties: {
			id,
			type: 'Depot' as const,
			name,
			postalcode: '8000',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com'
		}
	};
}

describe('MapSidebar', () => {
	beforeEach(() => {
		gotoMock.mockReset();
		getDepotAssociatedFarmIdMock.mockReset();
		getDepotAssociatedFarmIdMock.mockResolvedValue(null);
		getCurrentUserMock.mockReturnValue({
			id: 'user-1',
			name: 'Owner User',
			email: 'owner@example.com'
		});
		isInitializedMock.mockReturnValue(true);
	});

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

	it('depot openDetailView keeps focus on associated farm even if that farm detail is already active', async () => {
		pageState.url = new URL('http://localhost/#/farms/farm-a');
		pageState.data = { detailData: createFarmDetail('farm-a', 'Associated Farm A') };
		getDepotAssociatedFarmIdMock.mockResolvedValue('farm-a');
		const onEntryClick = vi.fn();

		const view = render(MapSidebar, {
			props: {
				entries: {
					type: 'FeatureCollection',
					features: [createFarmDetail('farm-a', 'Associated Farm A')]
				},
				onEntryClick
			}
		});

		await expect.poll(() => onEntryClick.mock.calls.length).toBe(1);

		view.component.openDetailView(createDepotFeature('depot-1', 'Depot One'));

		await expect.poll(() => getDepotAssociatedFarmIdMock.mock.calls.length).toBe(1);
		await expect.poll(() => onEntryClick.mock.calls.length).toBe(2);
		await expect.poll(() => gotoMock.mock.calls.length).toBe(1);
		expect(gotoMock.mock.calls[0]?.[0]).toBe('#/farms/farm-a');
		expect(onEntryClick.mock.calls[1]?.[0]?.properties?.id).toBe('farm-a');
	});

	it('renders sticky create actions and row action controls in my-entries scope', async () => {
		pageState.url = new URL('http://localhost/#/myentries');
		pageState.data = {};

		render(MapSidebar, {
			props: {
				entries: {
					type: 'FeatureCollection',
					features: []
				},
				myEntries: {
					type: 'FeatureCollection',
					features: [createFarmDetail('farm-3', 'Farm Three')]
				}
			}
		});

		await expect
			.poll(() => !!document.querySelector('[data-testid="my-entries-create-actions"]'))
			.toBe(true);
		expect(document.querySelector('[data-testid="create-farm-action"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="create-depot-action"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="create-initiative-action"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="entry-row-actions-desktop"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="entry-row-actions-mobile"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="entry-actions-overflow-trigger"]')).toBeTruthy();
	});
});

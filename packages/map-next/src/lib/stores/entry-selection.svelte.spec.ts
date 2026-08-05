import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
	DepotFeature,
	EntryFeature,
	EntryFeatureCollection,
	MainEntryFeature
} from '$lib/types/entries';
import { routeBuilders } from '$lib/utils/routes';

const gotoMock = vi.hoisted(() => vi.fn(async () => undefined));
const getAssociatedFarmIdForDepotMock = vi.hoisted(() =>
	vi.fn<(depotId: string) => Promise<string | null>>()
);

vi.mock('$app/navigation', () => ({ goto: gotoMock }));
vi.mock('$lib/api/entry-details', () => ({
	getAssociatedFarmIdForDepot: getAssociatedFarmIdForDepotMock
}));

import { createEntrySelection, type EntrySelection } from './entry-selection.svelte';

const address = { postalcode: '', city: '', state: '', country: '', link: '' };

function farm(id: string): MainEntryFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [0, 0] },
		properties: { id, name: id, type: 'Farm', products: [], ...address }
	};
}

function depot(id: string): DepotFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [0, 0] },
		properties: { id, name: id, type: 'Depot', ...address }
	};
}

function collection(features: EntryFeature[]): EntryFeatureCollection {
	return { type: 'FeatureCollection', features };
}

interface Deferred {
	promise: Promise<string | null>;
	resolve: (value: string | null) => void;
}

function deferred(): Deferred {
	let resolve!: (value: string | null) => void;
	const promise = new Promise<string | null>((res) => {
		resolve = res;
	});
	return { promise, resolve };
}

let entries = $state<EntryFeatureCollection>(collection([]));
let focusedEntry = $state<MainEntryFeature | undefined>(undefined);

describe('createEntrySelection', () => {
	let selection: EntrySelection;
	let cleanup: () => void;
	const onEntryClick = vi.fn();

	beforeEach(() => {
		gotoMock.mockClear();
		onEntryClick.mockClear();
		getAssociatedFarmIdForDepotMock.mockReset().mockResolvedValue(null);
		entries = collection([]);
		focusedEntry = undefined;
		cleanup = $effect.root(() => {
			selection = createEntrySelection({
				entries: () => entries,
				isMyEntriesScope: () => false,
				focusedEntry: () => focusedEntry,
				onEntryClick
			});
		});
		flushSync();
	});

	afterEach(() => {
		cleanup();
	});

	it('discards a depot resolution that a newer interaction superseded', async () => {
		entries = collection([farm('f1')]);
		const slow = deferred();
		getAssociatedFarmIdForDepotMock.mockReturnValueOnce(slow.promise);

		const stale = selection.handleEntryClick(depot('d1'));
		await selection.handleEntryClick(farm('f2'));

		onEntryClick.mockClear();
		gotoMock.mockClear();
		slow.resolve('f1');
		await stale;

		expect(onEntryClick).not.toHaveBeenCalled();
		expect(gotoMock).not.toHaveBeenCalled();
	});

	it('navigates for a depot whose associated farm is absent from entries', async () => {
		getAssociatedFarmIdForDepotMock.mockResolvedValue('f1');

		await selection.handleEntryClick(depot('d1'));

		expect(gotoMock).toHaveBeenCalledWith(routeBuilders.farm.detail('f1'));
		expect(onEntryClick).not.toHaveBeenCalled();
	});

	it('neither pans nor navigates for a depot with no associated farm', async () => {
		await selection.handleEntryClick(depot('d1'));

		expect(gotoMock).not.toHaveBeenCalled();
		expect(onEntryClick).not.toHaveBeenCalled();
	});

	it('suppresses the duplicate pan when the detail route resolves to the depot farm', async () => {
		const associatedFarm = farm('f1');
		entries = collection([associatedFarm]);
		getAssociatedFarmIdForDepotMock.mockResolvedValue('f1');

		await selection.handleEntryClick(depot('d1'));
		expect(onEntryClick).toHaveBeenCalledTimes(1);

		focusedEntry = associatedFarm;
		flushSync();

		expect(onEntryClick).toHaveBeenCalledTimes(1);
	});
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConfirmDialogOptions } from '$lib/stores/confirm-dialog.svelte';
import type { DepotFeature, FarmFeature, InitiativeFeature } from '$lib/types/entries';
import * as m from '$lib/paraglide/messages.js';

const calls = vi.hoisted(() => [] as string[]);

const gotoMock = vi.hoisted(() => vi.fn());
const invalidateAllMock = vi.hoisted(() => vi.fn());
const getMainEntryMock = vi.hoisted(() => vi.fn());
const deleteDepotMock = vi.hoisted(() => vi.fn());
const deleteFarmMock = vi.hoisted(() => vi.fn());
const deleteInitiativeMock = vi.hoisted(() => vi.fn());
const confirmMock = vi.hoisted(() => vi.fn<(options: ConfirmDialogOptions) => Promise<boolean>>());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());
const toastInfoMock = vi.hoisted(() => vi.fn());

vi.mock('$app/environment', () => ({ dev: false }));
vi.mock('$app/navigation', () => ({ goto: gotoMock, invalidateAll: invalidateAllMock }));
vi.mock('$lib/api/entry-details', () => ({ getMainEntry: getMainEntryMock }));
vi.mock('$lib/api/entry-mutations', () => ({
	deleteDepot: deleteDepotMock,
	deleteFarm: deleteFarmMock,
	deleteInitiative: deleteInitiativeMock
}));
vi.mock('$lib/stores/confirm-dialog.svelte', () => ({ confirmDialog: { confirm: confirmMock } }));
vi.mock('$lib/utils/toast', () => ({
	toastSuccess: toastSuccessMock,
	toastError: toastErrorMock,
	toastInfo: toastInfoMock
}));

import { createEntryActions, type EntryActions } from './entry-actions';

/** Records the call in order and resolves, so a whole flow can be asserted as a sequence. */
function records(name: string) {
	return async () => {
		calls.push(name);
	};
}

function depotFeature(id: string, associatedFarmId?: string): DepotFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.55, 47.35] },
		properties: {
			id,
			type: 'Depot',
			name: `Depot ${id}`,
			postalcode: '8002',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			farms: associatedFarmId
				? { type: 'FeatureCollection', features: [farmFeature(associatedFarmId)] }
				: undefined
		}
	};
}

function farmFeature(id: string, depotCount = 0): FarmFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.5, 47.3] },
		properties: {
			id,
			type: 'Farm',
			name: `Farm ${id}`,
			postalcode: '8000',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			products: [],
			depots: {
				type: 'FeatureCollection',
				features: Array.from({ length: depotCount }, (_, index) => depotFeature(`depot-${index}`))
			}
		}
	};
}

function initiativeFeature(id: string): InitiativeFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [8.6, 47.4] },
		properties: {
			id,
			type: 'Initiative',
			name: `Initiative ${id}`,
			postalcode: '8001',
			city: 'Zurich',
			state: 'ZH',
			country: 'CH',
			link: 'https://example.com',
			goals: []
		}
	};
}

function rowEvent(): Event {
	return { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as Event;
}

describe('createEntryActions', () => {
	let actions: EntryActions;
	let ownedFarmIds: ReadonlySet<string>;

	beforeEach(() => {
		calls.length = 0;
		vi.clearAllMocks();
		gotoMock.mockImplementation(records('goto'));
		invalidateAllMock.mockImplementation(records('invalidateAll'));
		deleteDepotMock.mockImplementation(records('deleteDepot'));
		deleteFarmMock.mockImplementation(records('deleteFarm'));
		deleteInitiativeMock.mockImplementation(records('deleteInitiative'));
		getMainEntryMock.mockImplementation(async () => farmFeature('farm-1'));
		confirmMock.mockResolvedValue(true);
		toastSuccessMock.mockImplementation(records('toastSuccess'));
		toastErrorMock.mockImplementation(records('toastError'));
		toastInfoMock.mockImplementation(records('toastInfo'));
		ownedFarmIds = new Set(['farm-1']);
		actions = createEntryActions({
			ownedFarmIds: () => ownedFarmIds,
			onRefreshMyEntries: records('onRefreshMyEntries')
		});
	});

	it('deletes a depot from the list and refreshes after navigating', async () => {
		await actions.deleteEntry(depotFeature('depot-1', 'farm-9'), rowEvent());

		expect(calls).toEqual(['deleteDepot', 'goto', 'onRefreshMyEntries', 'toastSuccess']);
		expect(gotoMock).toHaveBeenCalledWith('#/myentries', { replaceState: true });
		// The associated farm id was read before the delete, so the toast can offer it.
		expect(toastSuccessMock.mock.calls[0]?.[1]).toMatchObject({ action: expect.anything() });
	});

	it('deletes a farm, refreshing owned entries before invalidating the loaders', async () => {
		await actions.deleteEntry(farmFeature('farm-1'), rowEvent());

		expect(calls).toEqual([
			'deleteFarm',
			'goto',
			'onRefreshMyEntries',
			'invalidateAll',
			'toastSuccess'
		]);
	});

	it('deletes an initiative through the same sequence', async () => {
		await actions.deleteEntry(initiativeFeature('initiative-1'), rowEvent());

		expect(calls).toEqual([
			'deleteInitiative',
			'goto',
			'onRefreshMyEntries',
			'invalidateAll',
			'toastSuccess'
		]);
	});

	it('deletes a depot from an open farm profile without navigating away', async () => {
		await actions.deleteDepotFromProfile(depotFeature('depot-1', 'farm-1'));

		expect(calls).toEqual(['deleteDepot', 'invalidateAll', 'onRefreshMyEntries', 'toastSuccess']);
		expect(gotoMock).not.toHaveBeenCalled();
	});

	it('mutates nothing when the confirm dialog is declined', async () => {
		confirmMock.mockResolvedValue(false);

		await actions.deleteEntry(farmFeature('farm-1'), rowEvent());
		await actions.deleteEntry(depotFeature('depot-1'), rowEvent());
		await actions.deleteDepotFromProfile(depotFeature('depot-1'));

		expect(calls).toEqual([]);
	});

	it('ignores a second delete while one is still in flight', async () => {
		let releaseDelete!: () => void;
		deleteDepotMock.mockImplementationOnce(() => {
			calls.push('deleteDepot');
			return new Promise((resolve) => (releaseDelete = () => resolve(undefined)));
		});

		const first = actions.deleteEntry(depotFeature('depot-1'), rowEvent());
		await vi.waitUntil(() => deleteDepotMock.mock.calls.length === 1);

		await actions.deleteEntry(depotFeature('depot-2'), rowEvent());
		expect(deleteDepotMock).toHaveBeenCalledTimes(1);

		releaseDelete();
		await first;
	});

	it('clears the pending flag and toasts the error when a delete rejects', async () => {
		deleteDepotMock.mockImplementationOnce(async () => {
			calls.push('deleteDepot');
			throw new Error('network');
		});

		await actions.deleteEntry(depotFeature('depot-1'), rowEvent());
		expect(calls).toEqual(['deleteDepot', 'toastError']);

		await actions.deleteEntry(depotFeature('depot-2'), rowEvent());
		expect(deleteDepotMock).toHaveBeenCalledTimes(2);
	});

	it('points a user with no farms at creating one instead of a depot', () => {
		ownedFarmIds = new Set();

		actions.createEntry('Depot', rowEvent());

		expect(toastInfoMock).toHaveBeenCalledWith(m.map_sidebar_depot_needs_farm());
		expect(gotoMock).not.toHaveBeenCalled();
	});

	it('warns about detached depots only when the farm actually has some', async () => {
		await actions.deleteEntry(farmFeature('farm-1'), rowEvent());
		expect(confirmMock.mock.calls[0]?.[0]).toMatchObject({
			description: m.map_sidebar_delete_farm_confirm_description()
		});

		getMainEntryMock.mockImplementation(async () => farmFeature('farm-1', 2));
		await actions.deleteEntry(farmFeature('farm-1'), rowEvent());
		expect(confirmMock.mock.calls[1]?.[0]).toMatchObject({
			description: `${m.map_sidebar_delete_farm_confirm_description()} ${m.map_sidebar_delete_farm_confirm_depots_note()}`
		});
	});
});

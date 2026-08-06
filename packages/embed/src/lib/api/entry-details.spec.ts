import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAssociatedFarmIdForDepot, getDepotEntry, getMainEntry } from '$lib/api/entry-details';
import { getAccessToken } from '$lib/utils/localStorage';
import { headersOf } from '$lib/test/fetch-assertions';

vi.mock('$lib/utils/localStorage', () => ({
	getAccessToken: vi.fn(() => null)
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('getMainEntry', () => {
	beforeEach(() => {
		fetchMock.mockReset();
		vi.mocked(getAccessToken).mockReturnValue(null);
	});

	it('uses Authorization header when access token is available', async () => {
		vi.mocked(getAccessToken).mockReturnValue('test-token');
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				type: 'Feature',
				properties: { id: 'farm-1', type: 'Farm' }
			})
		});

		await getMainEntry('farms', 'farm-1');

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/farms/farm-1'),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer test-token'
				})
			})
		);
	});

	it('does not send Authorization header when no access token is available', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				type: 'Feature',
				properties: { id: 'initiative-1', type: 'Initiative' }
			})
		});

		await getMainEntry('initiatives', 'initiative-1');

		expect(fetchMock.mock.calls[0]?.[0]).toEqual(
			expect.stringContaining('/initiatives/initiative-1')
		);
		expect(headersOf(fetchMock.mock.calls[0]).has('authorization')).toBe(false);
	});
});

describe('getDepotEntry', () => {
	beforeEach(() => {
		fetchMock.mockReset();
		vi.mocked(getAccessToken).mockReturnValue(null);
	});

	it('uses Authorization header when access token is available', async () => {
		vi.mocked(getAccessToken).mockReturnValue('test-token');
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				type: 'Feature',
				properties: { id: 'depot-1', type: 'Depot' }
			})
		});

		await getDepotEntry('depot-1');

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/depots/depot-1'),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer test-token'
				})
			})
		);
	});

	it('does not send Authorization header when no access token is available', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				type: 'Feature',
				properties: { id: 'depot-2', type: 'Depot' }
			})
		});

		await getDepotEntry('depot-2');

		expect(fetchMock.mock.calls[0]?.[0]).toEqual(expect.stringContaining('/depots/depot-2'));
		expect(headersOf(fetchMock.mock.calls[0]).has('authorization')).toBe(false);
	});
});

describe('getAssociatedFarmIdForDepot', () => {
	beforeEach(() => {
		fetchMock.mockReset();
		vi.mocked(getAccessToken).mockReturnValue(null);
	});

	it('returns the associated farm id for a depot with one linked farm', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				type: 'Feature',
				properties: {
					id: 'depot-1',
					farms: {
						type: 'FeatureCollection',
						features: [{ type: 'Feature', properties: { id: 'farm-1' } }]
					}
				}
			})
		});

		await expect(getAssociatedFarmIdForDepot('depot-1')).resolves.toBe('farm-1');
	});

	it('returns the first linked farm when multiple farms are present', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				type: 'Feature',
				properties: {
					id: 'depot-2',
					farms: {
						type: 'FeatureCollection',
						features: [
							{ type: 'Feature', properties: { id: 'farm-a' } },
							{ type: 'Feature', properties: { id: 'farm-b' } }
						]
					}
				}
			})
		});

		await expect(getAssociatedFarmIdForDepot('depot-2')).resolves.toBe('farm-a');
	});

	it('returns null when depot has no linked farms', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				type: 'Feature',
				properties: {
					id: 'depot-3',
					farms: {
						type: 'FeatureCollection',
						features: []
					}
				}
			})
		});

		await expect(getAssociatedFarmIdForDepot('depot-3')).resolves.toBeNull();
	});

	it('returns null when depot request fails', async () => {
		fetchMock.mockResolvedValue({ ok: false });

		await expect(getAssociatedFarmIdForDepot('missing-depot')).resolves.toBeNull();
	});

	it('never sends an Authorization header, even when an access token is present', async () => {
		vi.mocked(getAccessToken).mockReturnValue('stale-token');
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				type: 'Feature',
				properties: {
					id: 'depot-4',
					farms: {
						type: 'FeatureCollection',
						features: [{ type: 'Feature', properties: { id: 'farm-1' } }]
					}
				}
			})
		});

		await getAssociatedFarmIdForDepot('depot-4');

		expect(fetchMock.mock.calls[0]?.[0]).toEqual(expect.stringContaining('/depots/depot-4'));
		expect(headersOf(fetchMock.mock.calls[0]).has('authorization')).toBe(false);
	});
});

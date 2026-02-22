import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDepotAssociatedFarmId } from './places';

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

describe('getDepotAssociatedFarmId', () => {
	beforeEach(() => {
		fetchMock.mockReset();
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

		await expect(getDepotAssociatedFarmId('depot-1')).resolves.toBe('farm-1');
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

		await expect(getDepotAssociatedFarmId('depot-2')).resolves.toBe('farm-a');
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

		await expect(getDepotAssociatedFarmId('depot-3')).resolves.toBeNull();
	});

	it('returns null when depot request fails', async () => {
		fetchMock.mockResolvedValue({ ok: false });

		await expect(getDepotAssociatedFarmId('missing-depot')).resolves.toBeNull();
	});
});

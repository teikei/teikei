import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveLegacyHashRedirect } from './route-compat';

const getDepotAssociatedFarmIdMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/utils/places', () => ({
	getDepotAssociatedFarmId: getDepotAssociatedFarmIdMock
}));

describe('resolveLegacyHashRedirect', () => {
	beforeEach(() => {
		getDepotAssociatedFarmIdMock.mockReset();
	});

	it('maps legacy auth account route to canonical auth account route', async () => {
		await expect(resolveLegacyHashRedirect('#/users/editAccount')).resolves.toEqual(
			'#/users/editaccount'
		);
	});

	it('maps legacy auth password route to canonical auth password route', async () => {
		await expect(resolveLegacyHashRedirect('#/users/editPassword')).resolves.toEqual(
			'#/users/editpassword'
		);
	});

	it('maps legacy depot detail route to associated farm detail route', async () => {
		getDepotAssociatedFarmIdMock.mockResolvedValue('farm-42');

		await expect(resolveLegacyHashRedirect('#/depots/2')).resolves.toEqual('#/farms/farm-42');
		expect(getDepotAssociatedFarmIdMock).toHaveBeenCalledWith('2');
	});

	it('falls back to map home when depot association is missing', async () => {
		getDepotAssociatedFarmIdMock.mockResolvedValue(null);

		await expect(resolveLegacyHashRedirect('#/depots/2')).resolves.toEqual('#/');
	});

	it('maps legacy depot edit route to home', async () => {
		await expect(resolveLegacyHashRedirect('#/depots/2/edit')).resolves.toEqual('#/');
	});

	it('maps legacy depot create route to home', async () => {
		await expect(resolveLegacyHashRedirect('#/depots/new')).resolves.toEqual('#/');
	});

	it('returns null for non-legacy routes', async () => {
		await expect(resolveLegacyHashRedirect('#/farms/5')).resolves.toBeNull();
	});
});

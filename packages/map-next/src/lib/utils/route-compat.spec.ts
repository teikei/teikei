import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveLegacyHashRedirect } from './route-compat';

const getDepotAssociatedFarmIdMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/api/places', () => ({
	getDepotAssociatedFarmId: getDepotAssociatedFarmIdMock
}));

describe('resolveLegacyHashRedirect', () => {
	beforeEach(() => {
		getDepotAssociatedFarmIdMock.mockReset();
	});

	it('maps legacy auth account route to canonical auth account route', async () => {
		await expect(resolveLegacyHashRedirect('#/users/editAccount')).resolves.toEqual({
			target: '#/users/editaccount',
			reason: 'auth-edit-account-alias'
		});
	});

	it('maps legacy auth password route to canonical auth password route', async () => {
		await expect(resolveLegacyHashRedirect('#/users/editPassword')).resolves.toEqual({
			target: '#/users/editpassword',
			reason: 'auth-edit-password-alias'
		});
	});

	it('maps legacy depot detail route to associated farm detail route', async () => {
		getDepotAssociatedFarmIdMock.mockResolvedValue('farm-42');

		await expect(resolveLegacyHashRedirect('#/depots/2')).resolves.toEqual({
			target: '#/farms/farm-42',
			reason: 'depot-detail-associated-farm'
		});
		expect(getDepotAssociatedFarmIdMock).toHaveBeenCalledWith('2');
	});

	it('falls back to map home when depot association is missing', async () => {
		getDepotAssociatedFarmIdMock.mockResolvedValue(null);

		await expect(resolveLegacyHashRedirect('#/depots/2')).resolves.toEqual({
			target: '#/',
			reason: 'depot-detail-fallback-home'
		});
	});

	it('returns null for non-legacy routes', async () => {
		await expect(resolveLegacyHashRedirect('#/farms/5')).resolves.toBeNull();
	});
});

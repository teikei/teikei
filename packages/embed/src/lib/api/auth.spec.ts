import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmUser, reactivateUser } from './auth';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('auth api token flows', () => {
	beforeEach(() => {
		fetchMock.mockReset();
	});

	it('confirms signup with verifySignupLong action', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ isVerified: true })
		});

		await expect(confirmUser({ confirmationToken: 'verify-123' })).resolves.toEqual({
			isVerified: true
		});

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/authManagement'),
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({
					action: 'verifySignupLong',
					value: 'verify-123'
				})
			})
		);
	});

	it('reactivates user with id/token payload', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => 'User login recorded, state has been reset.'
		});

		await expect(reactivateUser({ id: '42', token: 'reactivate-xyz' })).resolves.toBe(
			'User login recorded, state has been reset.'
		);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/user-reactivation'),
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({
					id: '42',
					token: 'reactivate-xyz'
				})
			})
		);
	});
});

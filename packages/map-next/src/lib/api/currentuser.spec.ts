import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser } from '$lib/api/currentuser';
import { getAccessToken, clearAccessToken } from '$lib/utils/localStorage';

vi.mock('$lib/utils/localStorage', () => ({
	getAccessToken: vi.fn(() => null),
	clearAccessToken: vi.fn()
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('getCurrentUser', () => {
	beforeEach(() => {
		fetchMock.mockReset();
		vi.mocked(getAccessToken).mockReturnValue(null);
		vi.mocked(clearAccessToken).mockReset();
	});

	it('returns null without a request when no token is stored', async () => {
		await expect(getCurrentUser()).resolves.toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('returns the user for a valid token', async () => {
		vi.mocked(getAccessToken).mockReturnValue('valid-token');
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ user: { id: '1', email: 'user@example.com' } })
		});

		await expect(getCurrentUser()).resolves.toEqual({ id: '1', email: 'user@example.com' });
		expect(clearAccessToken).not.toHaveBeenCalled();
	});

	it('clears the stored token when the API rejects it with 401', async () => {
		vi.mocked(getAccessToken).mockReturnValue('stale-token');
		fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });

		await expect(getCurrentUser()).resolves.toBeNull();
		expect(clearAccessToken).toHaveBeenCalled();
	});

	it('keeps the stored token on transient failures', async () => {
		vi.mocked(getAccessToken).mockReturnValue('valid-token');
		fetchMock.mockRejectedValue(new TypeError('network down'));

		await expect(getCurrentUser()).resolves.toBeNull();
		expect(clearAccessToken).not.toHaveBeenCalled();
	});
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '$lib/api/client';
import { getAccessToken } from '$lib/utils/localStorage';
import { ApiError } from '$lib/types/errors';

vi.mock('$lib/utils/localStorage', () => ({
	getAccessToken: vi.fn(() => null)
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('apiRequest', () => {
	beforeEach(() => {
		fetchMock.mockReset();
		vi.mocked(getAccessToken).mockReturnValue(null);
	});

	it('retries without Authorization when an optional-auth request is rejected with 401', async () => {
		vi.mocked(getAccessToken).mockReturnValue('stale-token');
		fetchMock
			.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
			.mockResolvedValueOnce({ ok: true, status: 200 });

		const response = await apiRequest('farms/farm-1', { auth: 'optional' });

		expect(response.ok).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			expect.stringContaining('/farms/farm-1'),
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer stale-token' })
			})
		);
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			expect.stringContaining('/farms/farm-1'),
			undefined
		);
	});

	it('does not retry when the optional-auth request succeeds', async () => {
		vi.mocked(getAccessToken).mockReturnValue('valid-token');
		fetchMock.mockResolvedValue({ ok: true, status: 200 });

		await apiRequest('farms/farm-1', { auth: 'optional' });

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('does not retry when no token was attached', async () => {
		fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });

		await expect(apiRequest('farms/farm-1', { auth: 'optional' })).rejects.toBeInstanceOf(ApiError);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('does not retry required-auth requests rejected with 401', async () => {
		vi.mocked(getAccessToken).mockReturnValue('stale-token');
		fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });

		await expect(apiRequest('authentication', { auth: 'required' })).rejects.toBeInstanceOf(
			ApiError
		);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});

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

	it('carries the Feathers error payload onto the ApiError', async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 401,
			json: async () => ({
				name: 'NotAuthenticated',
				message: 'Invalid login',
				code: 401,
				className: 'not-authenticated',
				data: { errorCode: 'INVALID_CREDENTIALS' }
			})
		});

		await expect(apiRequest('authentication', { auth: 'none' })).rejects.toMatchObject({
			status: 401,
			message: 'Invalid login',
			name: 'NotAuthenticated',
			className: 'not-authenticated',
			errorCode: 'INVALID_CREDENTIALS'
		});
	});

	it('leaves errorCode undefined when the body carries no code', async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 403,
			json: async () => ({ name: 'Forbidden', message: 'Nope', className: 'forbidden' })
		});

		const error = await apiRequest('farms', { auth: 'none' }).catch((thrown) => thrown);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.errorCode).toBeUndefined();
		expect(error.className).toBe('forbidden');
	});

	it('falls back to the caller message when the response has no JSON body', async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 429,
			json: async () => {
				throw new SyntaxError('Unexpected token T in JSON at position 0');
			}
		});

		const error = await apiRequest('authentication', {
			auth: 'none',
			errorMessage: 'Request failed'
		}).catch((thrown) => thrown);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(429);
		expect(error.message).toBe('Request failed');
		expect(error.errorCode).toBeUndefined();
		expect(error.name).toBe('ApiError');
	});
});

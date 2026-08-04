import { describe, expect, it } from 'vitest';
import * as m from '$lib/paraglide/messages.js';
import { ApiError } from '$lib/types/errors';
import { resolveApiErrorMessage } from './api-error';

const FALLBACK = 'caller fallback';

describe('resolveApiErrorMessage', () => {
	it('resolves a known code to its localized message', () => {
		const error = new ApiError('Invalid login', 401, { errorCode: 'INVALID_CREDENTIALS' });

		expect(resolveApiErrorMessage(error, FALLBACK)).toBe(m.errors_code_invalid_credentials());
	});

	it('never renders the server message', () => {
		const error = new ApiError('missing html template for reset_password', 500, {
			errorCode: 'SERVER_ERROR'
		});

		expect(resolveApiErrorMessage(error, FALLBACK)).not.toContain('html template');
	});

	it.each([
		[401, m.errors_status_unauthorized()],
		[403, m.errors_status_forbidden()],
		[404, m.errors_status_not_found()],
		[409, m.errors_status_conflict()],
		[422, m.errors_status_conflict()],
		[429, m.errors_status_rate_limited()],
		[500, m.errors_status_server()],
		[502, m.errors_status_server()]
	])('falls back to the status-class message for an unknown code (%i)', (status, expected) => {
		const error = new ApiError('Some server text', status, { errorCode: 'NOT_IN_THE_TABLE' });

		expect(resolveApiErrorMessage(error, FALLBACK)).toBe(expected);
	});

	it('gives 403 and 5xx distinct messages', () => {
		const forbidden = new ApiError('x', 403);
		const server = new ApiError('x', 500);

		expect(resolveApiErrorMessage(forbidden, FALLBACK)).not.toBe(
			resolveApiErrorMessage(server, FALLBACK)
		);
	});

	it('falls back by status when the code is missing', () => {
		expect(resolveApiErrorMessage(new ApiError('x', 429), FALLBACK)).toBe(
			m.errors_status_rate_limited()
		);
	});

	// A response with no JSON body yields an ApiError with a status but no code.
	it('resolves an unparseable 5xx body to the localized server message', () => {
		expect(resolveApiErrorMessage(new ApiError(FALLBACK, 503), FALLBACK)).toBe(
			m.errors_status_server()
		);
	});

	it('uses the caller fallback for a status class with no message', () => {
		expect(resolveApiErrorMessage(new ApiError('Bad Request', 400), FALLBACK)).toBe(FALLBACK);
	});

	it('uses the caller fallback for a non-ApiError, such as a network failure', () => {
		expect(resolveApiErrorMessage(new TypeError('Failed to fetch'), FALLBACK)).toBe(FALLBACK);
		expect(resolveApiErrorMessage(undefined, FALLBACK)).toBe(FALLBACK);
	});
});

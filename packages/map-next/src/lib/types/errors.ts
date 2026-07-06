/**
 * Error thrown for non-ok API responses, carrying the HTTP status so callers
 * can distinguish e.g. not-found and auth failures from network outages.
 */
export class ApiError extends Error {
	readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

/** Feathers error metadata carried alongside the HTTP status. */
export interface ApiErrorDetails {
	/** Stable identifier from the API's `data.errorCode`, resolved to a localized message. */
	errorCode?: string;
	/** Feathers error class, e.g. `NotAuthenticated`. Diagnostics only. */
	name?: string;
	/** Dasherized Feathers error class, e.g. `not-authenticated`. Diagnostics only. */
	className?: string;
}

/**
 * Error thrown for non-ok API responses, carrying the HTTP status so callers
 * can distinguish e.g. not-found and auth failures from network outages.
 *
 * `message` holds the server's English text and is for logging only — never
 * render it. Use `resolveApiErrorMessage` to get localized text.
 */
export class ApiError extends Error {
	readonly status: number;
	readonly errorCode?: string;
	readonly className?: string;

	constructor(message: string, status: number, details: ApiErrorDetails = {}) {
		super(message);
		this.name = details.name ?? 'ApiError';
		this.status = status;
		this.errorCode = details.errorCode;
		this.className = details.className;
	}
}

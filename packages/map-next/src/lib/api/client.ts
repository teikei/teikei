import config from '$lib/config/app-configuration';
import { getAccessToken } from '$lib/utils/localStorage';
import { ApiError } from '$lib/types/errors';

const { apiBaseUrl } = config;

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/**
 * - `none`: never attach the access token (public endpoint).
 * - `optional`: attach the token when one is available, otherwise send an
 *   unauthenticated request.
 * - `required`: attach the token, throwing when none is available.
 */
export type AuthMode = 'none' | 'optional' | 'required';

export interface ApiRequestConfig {
	method?: HttpMethod;
	/** JSON request body. Serialized automatically; sets `Content-Type`. */
	body?: unknown;
	auth?: AuthMode;
	/** Fallback error message when the response is not ok and carries no `message`. */
	errorMessage?: string;
}

/**
 * Builds an {@link ApiError} from a failed response, preferring the
 * server-provided `message` and falling back to the caller-supplied message.
 * Tolerates responses without a JSON body.
 */
async function buildResponseError(response: Response, fallback?: string): Promise<ApiError> {
	let serverMessage: string | undefined;
	try {
		const data = await response.json();
		if (data && typeof data.message === 'string') {
			serverMessage = data.message;
		}
	} catch {
		// Response had no JSON body; fall back to the provided message.
	}
	return new ApiError(serverMessage ?? fallback ?? 'Request failed', response.status);
}

/**
 * Performs a fetch against the configured API base URL with centralized
 * authentication and error handling. Throws when the response is not ok.
 */
export async function apiRequest(path: string, config: ApiRequestConfig = {}): Promise<Response> {
	const { method, body, auth = 'none', errorMessage } = config;

	const headers: Record<string, string> = {};

	if (body !== undefined) {
		headers['Content-Type'] = 'application/json';
	}

	let tokenAttached = false;
	if (auth !== 'none') {
		const accessToken = getAccessToken();
		if (accessToken) {
			headers.Authorization = `Bearer ${accessToken}`;
			tokenAttached = true;
		} else if (auth === 'required') {
			throw new ApiError('Authentication required', 401);
		}
	}

	const doFetch = (requestHeaders: Record<string, string>): Promise<Response> => {
		const init: RequestInit = {};
		if (method) {
			init.method = method;
		}
		if (body !== undefined) {
			init.body = JSON.stringify(body);
		}
		if (Object.keys(requestHeaders).length > 0) {
			init.headers = requestHeaders;
		}

		// Pass `undefined` for plain unauthenticated GETs so callers and tests see a
		// bare `fetch(url)` rather than an empty options object.
		return fetch(`${apiBaseUrl}/${path}`, Object.keys(init).length > 0 ? init : undefined);
	};

	let response = await doFetch(headers);

	// A stale token in localStorage must not break public endpoints: the API
	// rejects any request carrying an invalid token, so retry anonymously.
	if (response.status === 401 && auth === 'optional' && tokenAttached) {
		const anonymousHeaders = { ...headers };
		delete anonymousHeaders.Authorization;
		response = await doFetch(anonymousHeaders);
	}

	if (!response.ok) {
		throw await buildResponseError(response, errorMessage);
	}

	return response;
}

/**
 * Performs an {@link apiRequest} and parses the response body as JSON.
 */
export async function apiFetch<T>(path: string, config?: ApiRequestConfig): Promise<T> {
	const response = await apiRequest(path, config);
	return response.json() as Promise<T>;
}

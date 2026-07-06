import { redirect, isRedirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { ApiError } from '$lib/types/errors';
import { routeBuilders } from '$lib/utils/routes';

/**
 * How a drawer route's data load failed:
 * - `not-found`: the API answered 404 — the entry no longer exists or the
 *   link is invalid; retrying cannot succeed.
 * - `unavailable`: network outage or unexpected server error; worth retrying.
 */
export type LoadErrorKind = 'not-found' | 'unavailable';

/**
 * Runs a loader body and converts fetch failures into the drawer's designed
 * error state (`{ loadError }`) instead of bubbling to SvelteKit's error page
 * (the app also runs embedded in host pages, where the raw error page would
 * replace the whole embed).
 *
 * - SvelteKit redirects thrown inside `fn` pass through untouched.
 * - A 401 (expired/revoked token that passed the presence-only auth guard)
 *   redirects to sign-in with `signInReturnTarget` as the post-auth return.
 * - A 404 yields `loadError: 'not-found'` (no retry offered); anything else
 *   yields `loadError: 'unavailable'` and is logged in dev.
 *
 * `fallback` carries route-constant data (e.g. `detailType`) into the error
 * result so consumers keep their discriminants.
 */
export async function loadCatching<T, F extends Record<string, unknown>>(
	signInReturnTarget: string,
	fn: () => Promise<T>,
	fallback: F
): Promise<T | (F & { loadError: LoadErrorKind })>;
export async function loadCatching<T>(
	signInReturnTarget: string,
	fn: () => Promise<T>
): Promise<T | { loadError: LoadErrorKind }>;
export async function loadCatching<T, F extends Record<string, unknown>>(
	signInReturnTarget: string,
	fn: () => Promise<T>,
	fallback?: F
): Promise<T | (F & { loadError: LoadErrorKind })> {
	try {
		return await fn();
	} catch (error) {
		if (isRedirect(error)) {
			throw error;
		}
		if (error instanceof ApiError && error.status === 401) {
			redirect(302, routeBuilders.auth.signInWithRedirect(signInReturnTarget));
		}
		if (dev) {
			console.warn('Loader data fetch failed', error);
		}
		const loadError: LoadErrorKind =
			error instanceof ApiError && error.status === 404 ? 'not-found' : 'unavailable';
		return { ...(fallback ?? ({} as F)), loadError };
	}
}

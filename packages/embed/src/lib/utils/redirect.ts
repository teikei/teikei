import type { Page } from '@sveltejs/kit';
import type { HashRouteKind } from '$lib/utils/routes';
import { parseHashRoute, routeBuilders, toHashRoute } from '$lib/utils/routes';

/**
 * Allowlist of routes that require authentication and can be redirect targets.
 * This prevents open redirect vulnerabilities by only allowing redirects to known internal routes.
 */
const ALLOWED_REDIRECT_ROUTE_KINDS = new Set<HashRouteKind>([
	'home',
	'myentries',
	'farm-edit',
	'farm-create',
	'initiative-edit',
	'initiative-create',
	'legacy-depot-edit',
	'legacy-depot-create',
	'auth-edit-account',
	'auth-edit-password'
]);

/**
 * Extracts query parameters from a hash-based URL.
 * In hash routing, URLs look like /#/path?param=value, where the query
 * params are inside the hash fragment, not in the main URL's searchParams.
 */
function getHashSearchParams(page: Page): URLSearchParams {
	return parseHashRoute(page.url.hash).query;
}

/**
 * Redirect targets that may preserve a single `farm` query param. The
 * depot-create flow opens pre-associated with a farm (`#/depots/new?farm=<id>`);
 * that association must survive a sign-in round-trip. The value is only ever
 * used as an in-app hash query (a farm id), never as an external URL, so it
 * cannot introduce an open redirect.
 */
const REDIRECT_KINDS_ALLOWING_FARM = new Set<HashRouteKind>(['legacy-depot-create']);

/**
 * Validates a redirect URL and rebuilds a sanitized version from allowlisted
 * parts, or returns null when it is not a safe internal redirect target.
 * Only known internal route kinds are allowed (open-redirect protection); any
 * query param is rejected except a single `farm` on the depot-create target.
 */
function sanitizeAllowedRedirect(url: string): string | null {
	const parsed = parseHashRoute(url);

	if (!ALLOWED_REDIRECT_ROUTE_KINDS.has(parsed.kind)) {
		return null;
	}

	const allowsFarm = REDIRECT_KINDS_ALLOWING_FARM.has(parsed.kind);
	const extraParamKeys = [...parsed.query.keys()].filter((key) => !(allowsFarm && key === 'farm'));
	if (extraParamKeys.length > 0) {
		return null;
	}

	const path = toHashRoute(parsed.path);
	const farm = allowsFarm ? parsed.query.get('farm') : null;
	return farm ? `${path}?farm=${encodeURIComponent(farm)}` : path;
}

export function getRedirectUrl(page: Page): string {
	const hashParams = getHashSearchParams(page);
	const redirectParam = hashParams.get('redirect');

	if (redirectParam) {
		const sanitized = sanitizeAllowedRedirect(redirectParam);
		if (sanitized) {
			return sanitized;
		}
	}

	return routeBuilders.home();
}

export function isRedirect(page: Page): boolean {
	const hashParams = getHashSearchParams(page);
	return hashParams.has('redirect');
}

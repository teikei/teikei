import type { Page } from '@sveltejs/kit';
import { parseHashRoute, routeBuilders, toHashRoute } from '$lib/utils/routes';

/**
 * Allowlist of routes that require authentication and can be redirect targets.
 * This prevents open redirect vulnerabilities by only allowing redirects to known internal routes.
 */
const ALLOWED_REDIRECT_ROUTES = new Set<string>([
	routeBuilders.home(),
	routeBuilders.myEntries(),
	routeBuilders.auth.editAccount(),
	routeBuilders.auth.editPassword()
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
 * Validates that a redirect URL is safe to use.
 * Only allows redirects to known internal routes to prevent open redirect attacks.
 */
function isAllowedRedirect(url: string): boolean {
	const parsed = parseHashRoute(url);

	if (parsed.query.size > 0) {
		return false;
	}

	return ALLOWED_REDIRECT_ROUTES.has(toHashRoute(parsed.path));
}

export function getRedirectUrl(page: Page): string {
	const hashParams = getHashSearchParams(page);
	const redirectParam = hashParams.get('redirect');

	if (redirectParam && isAllowedRedirect(redirectParam)) {
		return toHashRoute(parseHashRoute(redirectParam).path);
	}

	return routeBuilders.home();
}

export function isRedirect(page: Page): boolean {
	const hashParams = getHashSearchParams(page);
	return hashParams.has('redirect');
}

import type { Page } from '@sveltejs/kit';

/**
 * Allowlist of routes that require authentication and can be redirect targets.
 * This prevents open redirect vulnerabilities by only allowing redirects to known internal routes.
 */
const ALLOWED_REDIRECT_ROUTES = new Set(['#/', '#/users/editaccount', '#/users/editpassword']);

/**
 * Extracts query parameters from a hash-based URL.
 * In hash routing, URLs look like /#/path?param=value, where the query
 * params are inside the hash fragment, not in the main URL's searchParams.
 */
function getHashSearchParams(page: Page): URLSearchParams {
	const hash = page.url.hash;
	const queryIndex = hash.indexOf('?');
	if (queryIndex === -1) {
		return new URLSearchParams();
	}
	return new URLSearchParams(hash.slice(queryIndex + 1));
}

/**
 * Validates that a redirect URL is safe to use.
 * Only allows redirects to known internal routes to prevent open redirect attacks.
 */
function isAllowedRedirect(url: string): boolean {
	return ALLOWED_REDIRECT_ROUTES.has(url);
}

export function getRedirectUrl(page: Page): string {
	const hashParams = getHashSearchParams(page);
	const redirectParam = hashParams.get('redirect');

	if (redirectParam && isAllowedRedirect(redirectParam)) {
		return redirectParam;
	}

	return '#/';
}

export function isRedirect(page: Page): boolean {
	const hashParams = getHashSearchParams(page);
	return hashParams.has('redirect');
}

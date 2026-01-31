import type { Page } from '@sveltejs/kit';

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

export function getRedirectUrl(page: Page): string {
	const hashParams = getHashSearchParams(page);
	const redirectParam = hashParams.get('redirect');
	return redirectParam || '#/';
}

export function isRedirect(page: Page): boolean {
	const hashParams = getHashSearchParams(page);
	return hashParams.has('redirect');
}

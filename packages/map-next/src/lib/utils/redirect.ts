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

/**
 * Validates and returns a safe redirect URL from the page's hash parameters.
 * Only allows internal application paths to prevent open redirect vulnerabilities.
 * External URLs (with :// or starting with //) are rejected.
 */
export function getRedirectUrl(page: Page): string {
	const hashParams = getHashSearchParams(page);
	const redirectParam = hashParams.get('redirect');
	
	// If no redirect parameter, return default
	if (!redirectParam) {
		return '#/';
	}
	
	// Check if the redirect is an external URL
	// Reject anything with :// (e.g., https://evil.com) or starting with // (protocol-relative URLs)
	if (redirectParam.includes('://') || redirectParam.startsWith('//')) {
		console.warn(`Blocked external redirect attempt: ${redirectParam}`);
		return '#/';
	}
	
	// Only allow hash-based internal routes (must start with #/)
	if (!redirectParam.startsWith('#/')) {
		console.warn(`Blocked invalid redirect format: ${redirectParam}`);
		return '#/';
	}
	
	// Return the validated internal redirect
	return redirectParam;
}

export function isRedirect(page: Page): boolean {
	const hashParams = getHashSearchParams(page);
	return hashParams.has('redirect');
}

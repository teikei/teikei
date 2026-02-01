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
	
	// Decode URL to catch encoded bypass attempts (e.g., %3a for :)
	let decodedRedirect: string;
	try {
		decodedRedirect = decodeURIComponent(redirectParam);
	} catch {
		// If decoding fails, treat as suspicious
		console.warn('Blocked malformed redirect parameter');
		return '#/';
	}
	
	// Check if the redirect is an external URL
	// Reject anything with :// (e.g., https://evil.com) or starting with // (protocol-relative URLs)
	if (decodedRedirect.includes('://') || decodedRedirect.startsWith('//')) {
		console.warn('Blocked external redirect attempt');
		return '#/';
	}
	
	// Only allow hash-based internal routes (must start with #/)
	if (!decodedRedirect.startsWith('#/')) {
		console.warn('Blocked invalid redirect format');
		return '#/';
	}
	
	// Validate that the redirect doesn't contain dangerous patterns
	// Block secondary hashes, javascript:, data:, or other protocol handlers
	const dangerousPatterns = [
		'javascript:',
		'data:',
		'vbscript:',
		'file:',
		'about:',
		'<script',
		'</script',
		'onerror=',
		'onload='
	];
	
	const lowerRedirect = decodedRedirect.toLowerCase();
	for (const pattern of dangerousPatterns) {
		if (lowerRedirect.includes(pattern)) {
			console.warn('Blocked redirect with dangerous pattern');
			return '#/';
		}
	}
	
	// Ensure there's only one hash in the redirect (no secondary fragments)
	const hashCount = (decodedRedirect.match(/#/g) || []).length;
	if (hashCount > 1) {
		console.warn('Blocked redirect with multiple hashes');
		return '#/';
	}
	
	// Return the validated internal redirect (decoded version that was validated)
	return decodedRedirect;
}

export function isRedirect(page: Page): boolean {
	const hashParams = getHashSearchParams(page);
	return hashParams.has('redirect');
}

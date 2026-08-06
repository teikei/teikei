/** True only for absolute http(s) URLs. */
export function isValidHttpUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

/**
 * Returns the URL only if it is a valid absolute http(s) URL, otherwise
 * `undefined`. Use at render time for any user-controlled `href` so that
 * `javascript:` / `data:` schemes never reach the DOM — the editor's Zod
 * validation is client-side only, and badge URLs come from the API unchecked.
 * Binding `href={undefined}` makes Svelte omit the attribute.
 */
export function safeHttpUrl(value: string | null | undefined): string | undefined {
	if (!value) {
		return undefined;
	}
	const trimmed = value.trim();
	return isValidHttpUrl(trimmed) ? trimmed : undefined;
}

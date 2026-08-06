/**
 * Copy the current profile's deep link to the clipboard. Returns whether the
 * copy succeeded so the caller can surface the matching toast (F12.1
 * share/copy-link action). Guards against environments without the async
 * clipboard API (older browsers, insecure contexts).
 */
export async function copyProfileLink(): Promise<boolean> {
	if (typeof window === 'undefined') {
		return false;
	}

	const url = window.location.href;
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(url);
			return true;
		}
	} catch {
		return false;
	}

	return false;
}

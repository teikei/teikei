import type { Page } from '@sveltejs/kit';

export function getRedirectUrl(page: Page): string {
	const redirectParam = page.url.searchParams.get('redirect');
	return redirectParam || '#/';
}

export function isRedirect(page: Page): boolean {
	return page.url.searchParams.has('redirect');
}

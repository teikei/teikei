import { describe, expect, it } from 'vitest';
import type { Page } from '@sveltejs/kit';
import { getRedirectUrl, isRedirect } from './redirect';
import { routeBuilders } from './routes';

function pageWithHash(hash: string): Page {
	return { url: { hash } } as unknown as Page;
}

function pageWithRedirect(redirectTarget: string): Page {
	return pageWithHash(routeBuilders.auth.signInWithRedirect(redirectTarget));
}

describe('getRedirectUrl', () => {
	it('returns an allowlisted internal target', () => {
		expect(getRedirectUrl(pageWithRedirect(routeBuilders.myEntries()))).toBe('#/myentries');
	});

	it('falls back to home when no redirect param is present', () => {
		expect(getRedirectUrl(pageWithHash('#/users/sign-in'))).toBe(routeBuilders.home());
	});

	it('rejects a redirect to a non-allowlisted route kind', () => {
		expect(getRedirectUrl(pageWithRedirect('#/farms/some-id'))).toBe(routeBuilders.home());
	});

	it('rejects an arbitrary query param on an allowlisted target (open-redirect guard)', () => {
		expect(getRedirectUrl(pageWithRedirect('#/myentries?next=https://evil.example'))).toBe(
			routeBuilders.home()
		);
	});

	it('preserves the farm param on the depot-create target', () => {
		expect(getRedirectUrl(pageWithRedirect(routeBuilders.depot.createForFarm('farm-42')))).toBe(
			'#/depots/new?farm=farm-42'
		);
	});

	it('rejects a depot-create target carrying an extra param beyond farm', () => {
		expect(getRedirectUrl(pageWithRedirect('#/depots/new?farm=farm-42&evil=1'))).toBe(
			routeBuilders.home()
		);
	});
});

describe('isRedirect', () => {
	it('is true only when a redirect param is present', () => {
		expect(isRedirect(pageWithRedirect(routeBuilders.myEntries()))).toBe(true);
		expect(isRedirect(pageWithHash('#/users/sign-in'))).toBe(false);
	});
});

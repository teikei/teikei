import { describe, expect, it } from 'vitest';
import {
	isAuthRouteHash,
	normalizeHashPath,
	parseHashRoute,
	routeBuilders,
	toHashRoute
} from './routes';

describe('routes utils', () => {
	it('normalizes hash and hash-like values into route paths', () => {
		expect(normalizeHashPath('#/users/sign-in')).toBe('/users/sign-in');
		expect(normalizeHashPath('/#/users/sign-in')).toBe('/users/sign-in');
		expect(normalizeHashPath('users/sign-in')).toBe('/users/sign-in');
		expect(normalizeHashPath('')).toBe('/');
	});

	it('builds canonical hash routes', () => {
		expect(routeBuilders.home()).toBe('#/');
		expect(routeBuilders.auth.signIn()).toBe('#/users/sign-in');
		expect(routeBuilders.farm.detail('42')).toBe('#/farms/42');
		expect(routeBuilders.initiative.edit('abc')).toBe('#/initiatives/abc/edit');
		expect(routeBuilders.farm.contact('42')).toBe('#/farms/42/contact');
		expect(routeBuilders.initiative.contact('abc')).toBe('#/initiatives/abc/contact');
		expect(routeBuilders.discovery.position(47.37, 8.54)).toBe('#/position/47.37,8.54');
	});

	it('builds entry detail routes per entry type', () => {
		expect(routeBuilders.entryDetail('Farm', '42')).toBe('#/farms/42');
		expect(routeBuilders.entryDetail('Initiative', 'abc')).toBe('#/initiatives/abc');
		expect(routeBuilders.entryDetail('Depot', 'depot 7')).toBe('#/depots/depot%207');
	});

	it('builds redirect route for sign-in with encoded redirect query', () => {
		expect(routeBuilders.auth.signInWithRedirect('#/users/editaccount')).toBe(
			'#/users/sign-in?redirect=%23%2Fusers%2Feditaccount'
		);
	});

	it('parses canonical dynamic routes with params and query', () => {
		const parsed = parseHashRoute('#/farms/farm-123/edit?tab=contact');

		expect(parsed.kind).toBe('farm-edit');
		expect(parsed.params.id).toBe('farm-123');
		expect(parsed.query.get('tab')).toBe('contact');
		expect(parsed.isLegacyAlias).toBe(false);
	});

	it('parses contact routes ahead of the detail matcher', () => {
		expect(parseHashRoute('#/farms/farm-123/contact').kind).toBe('farm-contact');
		expect(parseHashRoute('#/initiatives/init-1/contact').params.id).toBe('init-1');
		expect(parseHashRoute('#/initiatives/init-1/contact').kind).toBe('initiative-contact');
	});

	it('parses legacy aliases and marks them as legacy', () => {
		const parsed = parseHashRoute('/#/users/editAccount?redirect=%23%2Fusers%2Feditaccount');

		expect(parsed.kind).toBe('legacy-auth-edit-account');
		expect(parsed.query.get('redirect')).toBe('#/users/editaccount');
		expect(parsed.isLegacyAlias).toBe(true);
	});

	it('recognizes auth modal routes for canonical and legacy hashes', () => {
		expect(isAuthRouteHash('#/users/sign-up')).toBe(true);
		expect(isAuthRouteHash('#/users/sign-in')).toBe(true);
		expect(isAuthRouteHash('#/farms/2')).toBe(false);
	});

	it('returns unknown for unmatched routes but keeps normalized hash', () => {
		const parsed = parseHashRoute('/#/something/new?x=1');

		expect(parsed.kind).toBe('unknown');
		expect(parsed.path).toBe('/something/new');
		expect(parsed.hash).toBe(toHashRoute('/something/new?x=1'));
	});
});

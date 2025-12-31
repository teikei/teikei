import config from '../config/app-configuration';
/**
 * Prefixes the given route with the app's baseUrl from config.
 * Assumes baseUrl already contains the hash (e.g. '/karte#').
 * The route should start with a slash (e.g. '/foo').
 * @param route The route path, starting with a slash (e.g. '/foo')
 */
export function resolveHashRoute(route: string): string {
	const base = config.baseUrl.replace(/\/+$/, '');
	return `${base}${route}`;
}

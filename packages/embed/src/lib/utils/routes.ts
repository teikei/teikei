import type { MainEntryResource } from '$lib/utils/main-entries';
import type { EntryType } from '$lib/types/entries';

function ensureLeadingSlash(value: string): string {
	if (!value || value === '?') {
		return '/';
	}
	return value.startsWith('/') ? value : `/${value}`;
}

/**
 * Accepts '#/...', '/#/...', '/...', or bare paths and normalizes to '/...'.
 */
export function normalizeHashPath(route: string): string {
	const trimmed = route.trim();
	if (!trimmed || trimmed === '#') {
		return '/';
	}

	let path = trimmed;
	if (path.startsWith('/#/')) {
		path = path.slice(2);
	} else if (path.startsWith('#')) {
		path = path.slice(1);
	}

	return ensureLeadingSlash(path);
}

/**
 * Converts a path-like value into a normalized hash route.
 */
export function toHashRoute(route: string): string {
	return `#${normalizeHashPath(route)}`;
}

/**
 * Pre-computed hash routes for static paths used in navigation and link generation.
 */
const hashRoutes = {
	home: '#/',
	myEntries: '#/myentries',
	auth: {
		signIn: '#/users/sign-in',
		signUp: '#/users/sign-up',
		editAccount: '#/users/editaccount',
		editPassword: '#/users/editpassword',
		recoverPassword: '#/users/recoverpassword',
		resetPassword: '#/users/resetpassword'
	},
	create: {
		farm: '#/farms/new',
		initiative: '#/initiatives/new',
		depotLegacy: '#/depots/new'
	}
} as const;

export const routeBuilders = {
	home: () => hashRoutes.home,
	myEntries: () => hashRoutes.myEntries,
	auth: {
		signIn: () => hashRoutes.auth.signIn,
		signUp: () => hashRoutes.auth.signUp,
		editAccount: () => hashRoutes.auth.editAccount,
		editPassword: () => hashRoutes.auth.editPassword,
		recoverPassword: () => hashRoutes.auth.recoverPassword,
		resetPassword: () => hashRoutes.auth.resetPassword,
		signInWithRedirect: (redirectTo: string) => {
			const params = new URLSearchParams({ redirect: toHashRoute(redirectTo) });
			return `${hashRoutes.auth.signIn}?${params.toString()}`;
		}
	},
	farm: {
		detail: (id: string) => toHashRoute(`/farms/${encodeURIComponent(id)}`),
		edit: (id: string) => toHashRoute(`/farms/${encodeURIComponent(id)}/edit`),
		contact: (id: string) => toHashRoute(`/farms/${encodeURIComponent(id)}/contact`),
		create: () => hashRoutes.create.farm
	},
	initiative: {
		detail: (id: string) => toHashRoute(`/initiatives/${encodeURIComponent(id)}`),
		edit: (id: string) => toHashRoute(`/initiatives/${encodeURIComponent(id)}/edit`),
		contact: (id: string) => toHashRoute(`/initiatives/${encodeURIComponent(id)}/contact`),
		create: () => hashRoutes.create.initiative
	},
	depotLegacy: {
		detail: (id: string) => toHashRoute(`/depots/${encodeURIComponent(id)}`),
		edit: (id: string) => toHashRoute(`/depots/${encodeURIComponent(id)}/edit`),
		create: () => hashRoutes.create.depotLegacy
	},
	depot: {
		// Create/edit a depot in the context of a farm profile: the `farm` query
		// param preselects/hides the farm association and returns to that profile.
		createForFarm: (farmId: string) =>
			`${hashRoutes.create.depotLegacy}?farm=${encodeURIComponent(farmId)}`,
		editForFarm: (depotId: string, farmId: string) =>
			`${toHashRoute(`/depots/${encodeURIComponent(depotId)}/edit`)}?farm=${encodeURIComponent(
				farmId
			)}`
	},
	discovery: {
		location: (id: string) => toHashRoute(`/locations/${encodeURIComponent(id)}`),
		position: (lat: number | string, lon: number | string) => toHashRoute(`/position/${lat},${lon}`)
	},
	mainEntryDetail: (resource: MainEntryResource, id: string) => {
		if (resource === 'farms') {
			return routeBuilders.farm.detail(id);
		}
		return routeBuilders.initiative.detail(id);
	},
	entryDetail: (entryType: EntryType, id: string) => {
		if (entryType === 'Farm') {
			return routeBuilders.farm.detail(id);
		}
		if (entryType === 'Initiative') {
			return routeBuilders.initiative.detail(id);
		}
		return routeBuilders.depotLegacy.detail(id);
	}
} as const;

export type HashRouteKind =
	| 'home'
	| 'myentries'
	| 'auth-signin'
	| 'auth-signup'
	| 'auth-edit-account'
	| 'auth-edit-password'
	| 'auth-recover-password'
	| 'auth-reset-password'
	| 'farm-detail'
	| 'farm-edit'
	| 'farm-contact'
	| 'farm-create'
	| 'initiative-detail'
	| 'initiative-edit'
	| 'initiative-contact'
	| 'initiative-create'
	| 'location'
	| 'position'
	| 'internal-design'
	| 'legacy-auth-edit-account'
	| 'legacy-auth-edit-password'
	| 'legacy-depot-detail'
	| 'legacy-depot-edit'
	| 'legacy-depot-create'
	| 'unknown';

interface RouteMatcher {
	kind: Exclude<HashRouteKind, 'unknown'>;
	pattern: RegExp;
	isLegacyAlias?: boolean;
}

const ROUTE_MATCHERS: readonly RouteMatcher[] = [
	{ kind: 'home', pattern: /^\/$/ },
	{ kind: 'myentries', pattern: /^\/myentries$/ },

	{ kind: 'auth-signin', pattern: /^\/users\/sign-in$/ },
	{ kind: 'auth-signup', pattern: /^\/users\/sign-up$/ },
	{ kind: 'auth-edit-account', pattern: /^\/users\/editaccount$/ },
	{ kind: 'auth-edit-password', pattern: /^\/users\/editpassword$/ },
	{ kind: 'auth-recover-password', pattern: /^\/users\/recoverpassword$/ },
	{ kind: 'auth-reset-password', pattern: /^\/users\/resetpassword$/ },

	{ kind: 'farm-create', pattern: /^\/farms\/new$/ },
	{ kind: 'farm-edit', pattern: /^\/farms\/(?<id>[^/]+)\/edit$/ },
	{ kind: 'farm-contact', pattern: /^\/farms\/(?<id>[^/]+)\/contact$/ },
	{ kind: 'farm-detail', pattern: /^\/farms\/(?<id>[^/]+)$/ },

	{ kind: 'initiative-create', pattern: /^\/initiatives\/new$/ },
	{ kind: 'initiative-edit', pattern: /^\/initiatives\/(?<id>[^/]+)\/edit$/ },
	{ kind: 'initiative-contact', pattern: /^\/initiatives\/(?<id>[^/]+)\/contact$/ },
	{ kind: 'initiative-detail', pattern: /^\/initiatives\/(?<id>[^/]+)$/ },

	{ kind: 'location', pattern: /^\/locations\/(?<id>[^/]+)$/ },
	{ kind: 'position', pattern: /^\/position\/(?<lat>-?\d+(?:\.\d+)?),(?<lon>-?\d+(?:\.\d+)?)$/ },

	{
		kind: 'legacy-auth-edit-account',
		pattern: /^\/users\/editAccount$/,
		isLegacyAlias: true
	},
	{
		kind: 'legacy-auth-edit-password',
		pattern: /^\/users\/editPassword$/,
		isLegacyAlias: true
	},

	{ kind: 'legacy-depot-create', pattern: /^\/depots\/new$/, isLegacyAlias: true },
	{ kind: 'legacy-depot-edit', pattern: /^\/depots\/(?<id>[^/]+)\/edit$/, isLegacyAlias: true },
	{ kind: 'legacy-depot-detail', pattern: /^\/depots\/(?<id>[^/]+)$/, isLegacyAlias: true }
] as const;

const AUTH_ROUTE_KINDS = new Set<HashRouteKind>([
	'auth-signin',
	'auth-signup',
	'auth-edit-account',
	'auth-edit-password',
	'auth-recover-password',
	'auth-reset-password',
	'legacy-auth-edit-account',
	'legacy-auth-edit-password'
]);

export interface ParsedHashRoute {
	hash: string;
	path: string;
	query: URLSearchParams;
	kind: HashRouteKind;
	params: Record<string, string>;
	isLegacyAlias: boolean;
}

export function parseHashRoute(route: string): ParsedHashRoute {
	const normalizedPathWithQuery = normalizeHashPath(route);
	const queryIndex = normalizedPathWithQuery.indexOf('?');
	const path =
		queryIndex === -1
			? normalizedPathWithQuery
			: normalizedPathWithQuery.slice(0, queryIndex) || '/';
	const queryString = queryIndex === -1 ? '' : normalizedPathWithQuery.slice(queryIndex + 1);
	const query = new URLSearchParams(queryString);

	for (const matcher of ROUTE_MATCHERS) {
		const match = path.match(matcher.pattern);
		if (match) {
			const params = Object.fromEntries(
				Object.entries(match.groups ?? {}).map(([key, value]) => [key, decodeURIComponent(value)])
			);

			return {
				hash: toHashRoute(normalizedPathWithQuery),
				path,
				query,
				kind: matcher.kind,
				params,
				isLegacyAlias: !!matcher.isLegacyAlias
			};
		}
	}

	return {
		hash: toHashRoute(normalizedPathWithQuery),
		path,
		query,
		kind: 'unknown',
		params: {},
		isLegacyAlias: false
	};
}

export function isAuthRouteHash(route: string): boolean {
	return AUTH_ROUTE_KINDS.has(parseHashRoute(route).kind);
}

export function isInternalDesignRouteHash(route: string): boolean {
	return parseHashRoute(route).kind === 'internal-design';
}

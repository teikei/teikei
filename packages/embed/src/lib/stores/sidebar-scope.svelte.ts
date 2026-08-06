import { goto } from '$app/navigation';
import { page } from '$app/state';
import { authStore } from '$lib/stores/auth.svelte';
import {
	isAuthRouteHash,
	parseHashRoute,
	routeBuilders,
	type HashRouteKind,
	type ParsedHashRoute
} from '$lib/utils/routes';

export interface SidebarScope {
	readonly parsedRoute: ParsedHashRoute;
	readonly routeKind: HashRouteKind;
	/** `#/myentries` with a signed-in user — the sidebar lists owned entries only. */
	readonly isMyEntriesScope: boolean;
	readonly isUserAuthenticated: boolean;
	readonly isAuthInitialized: boolean;
	/** An auth modal route (sign-in/up, account/password editing) is active. */
	readonly isAuthModalRoute: boolean;
}

/**
 * Which scope the sidebar is in — the parsed hash route, the my-entries
 * predicate, and the sign-in redirect that guards it. Reads `page.url.hash` and
 * `authStore` directly (same pattern as `createMyEntriesStore`). Must be called
 * during component initialization (it registers an `$effect`).
 */
export function createSidebarScope(): SidebarScope {
	let redirectingToSignInForMyEntries = $state(false);

	const parsedRoute = $derived(parseHashRoute(page.url.hash));
	const isAuthModalRoute = $derived(isAuthRouteHash(page.url.hash));
	const routeKind = $derived(parsedRoute.kind);
	const isUserAuthenticated = $derived(authStore.isAuthenticated);
	const isAuthInitialized = $derived(authStore.isInitialized);
	const isMyEntriesScope = $derived(routeKind === 'myentries' && isUserAuthenticated);

	$effect(() => {
		if (routeKind !== 'myentries') {
			redirectingToSignInForMyEntries = false;
			return;
		}

		if (!isAuthInitialized || isUserAuthenticated || redirectingToSignInForMyEntries) {
			return;
		}

		redirectingToSignInForMyEntries = true;
		void goto(routeBuilders.auth.signInWithRedirect(routeBuilders.myEntries()));
	});

	return {
		get parsedRoute() {
			return parsedRoute;
		},
		get routeKind() {
			return routeKind;
		},
		get isMyEntriesScope() {
			return isMyEntriesScope;
		},
		get isUserAuthenticated() {
			return isUserAuthenticated;
		},
		get isAuthInitialized() {
			return isAuthInitialized;
		},
		get isAuthModalRoute() {
			return isAuthModalRoute;
		}
	};
}

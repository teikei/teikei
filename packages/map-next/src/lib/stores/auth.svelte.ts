import type { CurrentUser } from '$lib/types/user';
import { getCurrentUser as getCurrentUserApi } from '$lib/api/currentuser';

const authState = $state<{
	user: CurrentUser | null;
	initialized: boolean;
}>({
	user: null,
	initialized: false
});

/**
 * Initialize the auth store by fetching the current user from the API.
 * This should be called once on app startup.
 */
export async function initializeAuth(): Promise<CurrentUser | null> {
	const user = await getCurrentUserApi();
	authState.user = user;
	authState.initialized = true;
	return user;
}

export function getCurrentUser(): CurrentUser | null {
	return authState.user;
}
export function setCurrentUser(user: CurrentUser | null) {
	authState.user = user;
	authState.initialized = true;
}

export function clearCurrentUser() {
	authState.user = null;
}

export function isAuthenticated(): boolean {
	return authState.user !== null;
}

export function isInitialized(): boolean {
	return authState.initialized;
}

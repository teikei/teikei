import { writable, derived } from 'svelte/store';
import type { CurrentUser } from '$lib/api/auth';

const userStore = writable<CurrentUser | null>(null);
const initializedStore = writable(false);

export const currentUser = { subscribe: userStore.subscribe };
export const isAuthenticated = derived(userStore, ($user) => $user !== null);
export const isInitialized = { subscribe: initializedStore.subscribe };

/**
 * Initialize the auth store by fetching the current user from the API.
 * This should be called once on app startup.
 */
export async function initializeAuth(): Promise<CurrentUser | null> {
	const { getCurrentUser } = await import('$lib/api/auth');
	const user = await getCurrentUser();
	userStore.set(user);
	initializedStore.set(true);
	return user;
}

export function setCurrentUser(user: CurrentUser | null) {
	userStore.set(user);
	initializedStore.set(true);
}

export function clearCurrentUser() {
	userStore.set(null);
}

export function getCurrentUser(): CurrentUser | null {
	let user: CurrentUser | null = null;
	userStore.subscribe((value) => {
		user = value;
	})();
	return user;
}

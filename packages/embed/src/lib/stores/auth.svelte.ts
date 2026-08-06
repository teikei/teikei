import type { CurrentUser } from '$lib/types/user';
import { getCurrentUser as getCurrentUserApi } from '$lib/api/currentuser';

/**
 * Reactive authentication state for the app. The app is a client-only SPA
 * (`router.type === 'hash'` disables SSR entirely), so a module-level singleton
 * is safe — there is no server runtime that could leak state between users.
 */
class AuthStore {
	#user = $state<CurrentUser | null>(null);
	#initialized = $state(false);
	#pending: Promise<CurrentUser | null> | null = null;

	get user(): CurrentUser | null {
		return this.#user;
	}

	get isInitialized(): boolean {
		return this.#initialized;
	}

	get isAuthenticated(): boolean {
		return this.#user !== null;
	}

	/**
	 * Fetches the current user from the API. Call once on app startup.
	 */
	async initialize(): Promise<CurrentUser | null> {
		const user = await getCurrentUserApi();
		this.#user = user;
		this.#initialized = true;
		return user;
	}

	/**
	 * Resolves once the session has been restored, kicking off the fetch if it
	 * hasn't started yet and de-duplicating concurrent callers. Route guards
	 * must await this before reading `user`, otherwise a direct navigation to a
	 * protected route redirects to sign-in before the session has loaded.
	 */
	async ensureInitialized(): Promise<CurrentUser | null> {
		if (this.#initialized) {
			return this.#user;
		}
		if (!this.#pending) {
			this.#pending = this.initialize().finally(() => {
				this.#pending = null;
			});
		}
		return this.#pending;
	}

	setUser(user: CurrentUser | null): void {
		this.#user = user;
		this.#initialized = true;
	}

	clear(): void {
		this.#user = null;
	}
}

export const authStore = new AuthStore();

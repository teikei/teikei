import type { CurrentUser } from '$lib/types/user';
import { getAccessToken, clearAccessToken } from '$lib/utils/localStorage';
import { apiFetch } from '$lib/api/client';
import { ApiError } from '$lib/types/errors';

export async function getCurrentUser(): Promise<CurrentUser | null> {
	const accessToken = getAccessToken();
	if (!accessToken) {
		return null;
	}

	try {
		const data = await apiFetch<{ user?: CurrentUser }>('authentication', {
			method: 'POST',
			auth: 'required',
			body: {
				strategy: 'jwt',
				accessToken
			}
		});
		return data.user ?? null;
	} catch (error) {
		// A rejected token is permanently dead; drop it so later
		// `auth: 'optional'` requests go out anonymously instead of
		// carrying it and getting 401s on public endpoints.
		if (error instanceof ApiError && error.status === 401) {
			clearAccessToken();
		}
		return null;
	}
}

import type { CurrentUser } from '$lib/types/user';
import { getAccessToken } from '$lib/utils/localStorage';
import { apiFetch } from '$lib/api/client';

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
	} catch {
		return null;
	}
}

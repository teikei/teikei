import config from '$lib/config/app-configuration';
import type { CurrentUser } from '$lib/types/user';
import { getAccessToken } from '$lib/utils/localStorage';

const { apiBaseUrl } = config;

export async function getCurrentUser(): Promise<CurrentUser | null> {
	const accessToken = getAccessToken();
	if (!accessToken) {
		return null;
	}

	try {
		const response = await fetch(`${apiBaseUrl}/authentication`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify({
				strategy: 'jwt',
				accessToken
			})
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data.user || null;
	} catch {
		return null;
	}
}

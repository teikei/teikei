const ACCESS_TOKEN_KEY = 'accessToken';

export function getAccessToken(): string | null {
	if (typeof window !== 'undefined') {
		return localStorage.getItem(ACCESS_TOKEN_KEY);
	}
	return null;
}

export function setAccessToken(token: string): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(ACCESS_TOKEN_KEY, token);
	}
}

export function clearAccessToken(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(ACCESS_TOKEN_KEY);
	}
}

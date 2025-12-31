export function getAccessToken(): string | null {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken');
	}
	return null;
}

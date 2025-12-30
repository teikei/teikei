import config from '$lib/config/app-configuration';

const { apiBaseUrl } = config;

export interface SignInParams {
	email: string;
	password: string;
}

export interface SignInResponse {
	accessToken: string;
	user: {
		id: string;
		email: string;
		name: string;
	};
}

export interface SignUpParams {
	email: string;
	password: string;
	name: string;
	phone?: string;
	baseurl: string;
	locale: string;
}

export interface SignUpResponse {
	id: string;
	email: string;
	name: string;
	type: string;
}

export interface AuthError {
	message: string;
	code?: string;
}

export async function signIn(params: SignInParams): Promise<SignInResponse> {
	const response = await fetch(`${apiBaseUrl}/authentication`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			strategy: 'local',
			email: params.email,
			password: params.password
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Sign in failed');
	}

	const data = await response.json();

	// Store access token for future requests
	if (typeof window !== 'undefined' && data.accessToken) {
		localStorage.setItem('accessToken', data.accessToken);
	}

	return data;
}

export async function signUp(params: SignUpParams): Promise<SignUpResponse> {
	const response = await fetch(`${apiBaseUrl}/users`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: params.email,
			password: params.password,
			name: params.name,
			phone: params.phone || '',
			baseurl: params.baseurl,
			locale: params.locale
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Sign up failed');
	}

	return response.json();
}

export async function signOut(): Promise<void> {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('accessToken');
	}
}

export function getAccessToken(): string | null {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken');
	}
	return null;
}

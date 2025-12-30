import config from '$lib/config/app-configuration';
import { setCurrentUser, clearCurrentUser } from '$lib/stores/auth';

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

	if (data.user) {
		setCurrentUser(data.user);
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
	clearCurrentUser();
}

export function getAccessToken(): string | null {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken');
	}
	return null;
}

export interface UpdateUserParams {
	id: string;
	name: string;
	phone?: string;
	email: string;
	locale?: string;
	password?: string;
}

export interface UpdateUserResponse {
	id: string;
	name: string;
	email: string;
	phone?: string;
	locale?: string;
}

export async function updateUser(params: UpdateUserParams): Promise<UpdateUserResponse> {
	const accessToken = getAccessToken();
	if (!accessToken) {
		throw new Error('Not authenticated');
	}

	const response = await fetch(`${apiBaseUrl}/users/${params.id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify(params)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Update failed');
	}

	return response.json();
}

export interface UpdatePasswordParams {
	oldPassword: string;
	password: string;
	email: string;
}

export async function updatePassword(params: UpdatePasswordParams): Promise<void> {
	const accessToken = getAccessToken();
	if (!accessToken) {
		throw new Error('Not authenticated');
	}

	const response = await fetch(`${apiBaseUrl}/authManagement`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify({
			action: 'passwordChange',
			value: {
				user: { email: params.email },
				oldPassword: params.oldPassword,
				password: params.password
			}
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Password change failed');
	}
}

export interface RecoverPasswordParams {
	email: string;
}

export async function recoverPassword(params: RecoverPasswordParams): Promise<void> {
	const response = await fetch(`${apiBaseUrl}/authManagement`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			action: 'sendResetPwd',
			value: params
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Password recovery failed');
	}
}

export interface ResetPasswordParams {
	resetPasswordToken: string;
	password: string;
}

export async function resetPassword(params: ResetPasswordParams): Promise<void> {
	const response = await fetch(`${apiBaseUrl}/authManagement`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			action: 'resetPwdLong',
			value: {
				token: params.resetPasswordToken,
				password: params.password
			}
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Password reset failed');
	}
}

export interface CurrentUser {
	id: string;
	email: string;
	name: string;
	phone?: string;
	locale?: string;
}

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

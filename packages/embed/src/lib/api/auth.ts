import { authStore } from '$lib/stores/auth.svelte';
import { setAccessToken, clearAccessToken } from '$lib/utils/localStorage';
import { apiFetch, apiRequest } from '$lib/api/client';

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

export interface UpdatePasswordParams {
	oldPassword: string;
	password: string;
	email: string;
}

export type UpdatePasswordResponse = void;

export interface RecoverPasswordParams {
	email: string;
}

export type RecoverPasswordResponse = void;

export interface ResetPasswordParams {
	resetPasswordToken: string;
	password: string;
}

export type ResetPasswordResponse = void;

export interface ConfirmUserParams {
	confirmationToken: string;
}

export interface ConfirmUserResponse {
	isVerified?: boolean;
}

export interface ReactivateUserParams {
	id: string;
	token: string;
}

export type ReactivateUserResponse = string;

export async function signIn(params: SignInParams): Promise<SignInResponse> {
	const data = await apiFetch<SignInResponse>('authentication', {
		method: 'POST',
		body: {
			strategy: 'local',
			email: params.email,
			password: params.password
		},
		errorMessage: 'Sign in failed'
	});

	if (data.accessToken) {
		setAccessToken(data.accessToken);
	}

	if (data.user) {
		authStore.setUser(data.user);
	}

	return data;
}

export async function signUp(params: SignUpParams): Promise<SignUpResponse> {
	return apiFetch<SignUpResponse>('users', {
		method: 'POST',
		body: {
			email: params.email,
			password: params.password,
			name: params.name,
			phone: params.phone || '',
			baseurl: params.baseurl,
			locale: params.locale
		},
		errorMessage: 'Sign up failed'
	});
}

export async function signOut(): Promise<void> {
	clearAccessToken();
	authStore.clear();
}

export async function updateUser(params: UpdateUserParams): Promise<UpdateUserResponse> {
	return apiFetch<UpdateUserResponse>(`users/${params.id}`, {
		method: 'PATCH',
		body: params,
		auth: 'required',
		errorMessage: 'Update failed'
	});
}

export async function updatePassword(
	params: UpdatePasswordParams
): Promise<UpdatePasswordResponse> {
	await apiRequest('authManagement', {
		method: 'POST',
		auth: 'required',
		body: {
			action: 'passwordChange',
			value: {
				user: { email: params.email },
				oldPassword: params.oldPassword,
				password: params.password
			}
		},
		errorMessage: 'Password change failed'
	});
}

export async function recoverPassword(
	params: RecoverPasswordParams
): Promise<RecoverPasswordResponse> {
	await apiRequest('authManagement', {
		method: 'POST',
		body: {
			action: 'sendResetPwd',
			value: params
		},
		errorMessage: 'Password recovery failed'
	});
}

export async function resetPassword(params: ResetPasswordParams): Promise<ResetPasswordResponse> {
	await apiRequest('authManagement', {
		method: 'POST',
		body: {
			action: 'resetPwdLong',
			value: {
				token: params.resetPasswordToken,
				password: params.password
			}
		},
		errorMessage: 'Password reset failed'
	});
}

export async function confirmUser(params: ConfirmUserParams): Promise<ConfirmUserResponse> {
	return apiFetch<ConfirmUserResponse>('authManagement', {
		method: 'POST',
		body: {
			action: 'verifySignupLong',
			value: params.confirmationToken
		},
		errorMessage: 'User confirmation failed'
	});
}

export async function reactivateUser(
	params: ReactivateUserParams
): Promise<ReactivateUserResponse> {
	return apiFetch<ReactivateUserResponse>('user-reactivation', {
		method: 'POST',
		body: {
			id: params.id,
			token: params.token
		},
		errorMessage: 'User reactivation failed'
	});
}

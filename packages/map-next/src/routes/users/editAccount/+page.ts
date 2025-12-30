import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { isInitialized, initializeAuth, getCurrentUser } from '$lib/stores/auth';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// Initialize auth store if not already done
	if (!get(isInitialized)) {
		await initializeAuth();
	}

	const user = getCurrentUser();

	if (!user) {
		redirect(302, '/#/users/signin?redirect=/users/editaccount');
	}

	return { user };
};

import { redirect } from '@sveltejs/kit';
import { isInitialized, initializeAuth, getCurrentUser } from '$lib/stores/auth.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// Initialize auth store if not already done
	if (!isInitialized()) {
		await initializeAuth();
	}

	const user = getCurrentUser();

	if (!user) {
		redirect(302, '/#/users/signin?redirect=/users/editpassword');
	}

	return { user };
};

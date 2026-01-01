import { redirect } from '@sveltejs/kit';
import { getCurrentUser } from '$lib/stores/auth.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const user = getCurrentUser();

	if (!user) {
		redirect(302, '#/users/signin?redirect=#/users/editpassword');
	}

	return { user };
};

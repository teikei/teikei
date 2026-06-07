import { redirect } from '@sveltejs/kit';
import { authStore } from '$lib/stores/auth.svelte';
import { routeBuilders } from '$lib/utils/routes';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const user = authStore.user;

	if (!user) {
		redirect(302, routeBuilders.auth.signInWithRedirect(routeBuilders.auth.editPassword()));
	}

	return { user };
};

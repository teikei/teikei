import { redirect } from '@sveltejs/kit';
import { getCurrentUser } from '$lib/stores/auth.svelte';
import { routeBuilders } from '$lib/utils/routes';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const user = getCurrentUser();

	if (!user) {
		redirect(302, routeBuilders.auth.signInWithRedirect(routeBuilders.auth.editAccount()));
	}

	return { user };
};

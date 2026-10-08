import { redirect } from '@sveltejs/kit';
import { parseHashRoute, routeBuilders } from '$lib/utils/routes';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	// The app is hash-routed, so the reset link may carry the token in the real
	// query string or inside the hash (`#/users/resetpassword?reset_password_token=`).
	// Check both independently: host pages may have their own query string.
	const resetToken =
		url.searchParams.get('reset_password_token') ??
		parseHashRoute(url.hash).query.get('reset_password_token');

	if (!resetToken) {
		redirect(302, routeBuilders.home());
	}

	return { resetToken };
};

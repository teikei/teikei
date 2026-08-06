import { redirect } from '@sveltejs/kit';
import { routeBuilders } from '$lib/utils/routes';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// The app is hash-routed, so the reset link may carry the token in the real
	// query string or inside the hash (`#/users/resetpassword?reset_password_token=`).
	const searchParams = new URLSearchParams(
		window.location.search || window.location.hash.split('?')[1] || ''
	);
	const resetToken = searchParams.get('reset_password_token');

	if (!resetToken) {
		redirect(302, routeBuilders.home());
	}

	return { resetToken };
};

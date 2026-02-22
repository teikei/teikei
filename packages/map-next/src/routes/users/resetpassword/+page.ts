import { redirect } from '@sveltejs/kit';
import { hashRoutes } from '$lib/utils/routes';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// Get the reset token from query string
	// Handle both ?reset_password_token= and hash-based query strings
	const searchParams = new URLSearchParams(
		window.location.search || window.location.hash.split('?')[1] || ''
	);
	const resetToken = searchParams.get('reset_password_token');

	if (!resetToken) {
		redirect(302, hashRoutes.home);
	}

	return { resetToken };
};

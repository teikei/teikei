import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const searchParams = new URLSearchParams(
		window.location.search || window.location.hash.split('?')[1] || ''
	);
	const confirmationToken = searchParams.get('confirmation_token');

	if (!confirmationToken) {
		redirect(302, '#/');
	}

	return { confirmationToken };
};

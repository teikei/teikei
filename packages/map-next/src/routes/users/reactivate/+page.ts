import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const searchParams = new URLSearchParams(
		window.location.search || window.location.hash.split('?')[1] || ''
	);
	const reactivationToken = searchParams.get('reactivation_token');
	const userId = searchParams.get('user_id');

	if (!reactivationToken || !userId) {
		redirect(302, '#/');
	}

	return { reactivationToken, userId };
};

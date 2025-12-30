import { redirect } from '@sveltejs/kit';
import { getCurrentUser } from '$lib/api/auth';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	const user = await getCurrentUser();

	if (!user) {
		redirect(302, '/#/users/sign-in?redirect=/users/editAccount');
	}

	return { user };
};

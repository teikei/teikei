import { error } from '@sveltejs/kit';
import { resolveLegacyHashRedirect } from '$lib/utils/route-compat';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const resolution = await resolveLegacyHashRedirect(url.hash);

	if (!resolution) {
		throw error(404, 'Not found');
	}

	return {
		redirectTarget: resolution
	};
};

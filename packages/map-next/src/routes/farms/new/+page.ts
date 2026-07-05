import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getBadges, getProducts } from '$lib/api/catalog';
import { routeBuilders } from '$lib/utils/routes';
import { getAccessToken } from '$lib/utils/localStorage';
import { loadCatching } from '$lib/utils/load-error';
import type { EntryEditorData } from '$lib/types/editor';

export const load: PageLoad = () => {
	if (!getAccessToken()) {
		throw redirect(302, routeBuilders.auth.signInWithRedirect(routeBuilders.farm.create()));
	}

	return loadCatching(routeBuilders.farm.create(), async () => {
		const [products, badges] = await Promise.all([getProducts(), getBadges()]);
		const editorData: EntryEditorData = {
			mode: 'create',
			entryType: 'Farm',
			products,
			goals: [],
			badges
		};

		return { editorData };
	});
};

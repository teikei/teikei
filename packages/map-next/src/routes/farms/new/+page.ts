import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getBadges, getProducts } from '$lib/api/catalog';
import { routeBuilders } from '$lib/utils/routes';
import { getAccessToken } from '$lib/utils/localStorage';
import type { EntryEditorData } from '$lib/types/editor';

export const load: PageLoad = async () => {
	if (!getAccessToken()) {
		throw redirect(302, routeBuilders.auth.signInWithRedirect(routeBuilders.farm.create()));
	}

	try {
		const [products, badges] = await Promise.all([getProducts(), getBadges()]);
		const editorData: EntryEditorData = {
			mode: 'create',
			entryType: 'Farm',
			products,
			goals: [],
			badges
		};

		return { editorData };
	} catch {
		// Render the designed error state in the drawer instead of bubbling to
		// SvelteKit's error page (the app also runs embedded in host pages).
		return { loadError: true };
	}
};

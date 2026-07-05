import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getBadges, getProducts } from '$lib/api/catalog';
import { getMainEntry } from '$lib/api/entry-details';
import type { EntryEditorData } from '$lib/types/editor';
import { getAccessToken } from '$lib/utils/localStorage';
import { routeBuilders } from '$lib/utils/routes';

export const load: PageLoad = async ({ params }) => {
	if (!getAccessToken()) {
		throw redirect(302, routeBuilders.auth.signInWithRedirect(routeBuilders.farm.edit(params.id)));
	}

	try {
		const [detailData, products, badges] = await Promise.all([
			getMainEntry('farms', params.id),
			getProducts(),
			getBadges()
		]);
		const editorData: EntryEditorData = {
			mode: 'edit',
			entryType: 'Farm',
			products,
			goals: [],
			badges
		};

		return { detailData, detailType: 'Farm' as const, editorData };
	} catch {
		// Render the designed error state in the drawer instead of bubbling to
		// SvelteKit's error page (the app also runs embedded in host pages).
		return { detailType: 'Farm' as const, loadError: true };
	}
};

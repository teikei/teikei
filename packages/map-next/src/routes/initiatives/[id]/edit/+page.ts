import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getBadges, getGoals } from '$lib/api/catalog';
import { getMainEntry } from '$lib/api/entry-details';
import type { EntryEditorData } from '$lib/types/editor';
import { routeBuilders } from '$lib/utils/routes';
import { getAccessToken } from '$lib/utils/localStorage';

export const load: PageLoad = async ({ params }) => {
	if (!getAccessToken()) {
		throw redirect(
			302,
			routeBuilders.auth.signInWithRedirect(routeBuilders.initiative.edit(params.id))
		);
	}

	try {
		const [detailData, goals, badges] = await Promise.all([
			getMainEntry('initiatives', params.id),
			getGoals(),
			getBadges()
		]);
		const editorData: EntryEditorData = {
			mode: 'edit',
			entryType: 'Initiative',
			products: [],
			goals,
			badges
		};

		return { detailData, detailType: 'Initiative' as const, editorData };
	} catch {
		// Render the designed error state in the drawer instead of bubbling to
		// SvelteKit's error page (the app also runs embedded in host pages).
		return { detailType: 'Initiative' as const, loadError: true };
	}
};

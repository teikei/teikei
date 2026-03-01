import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getBadges, getGoals } from '$lib/api/catalog';
import { routeBuilders } from '$lib/utils/routes';
import { getAccessToken } from '$lib/utils/localStorage';
import type { EntryEditorData } from '$lib/types/editor';

export const load: PageLoad = async () => {
	if (!getAccessToken()) {
		throw redirect(302, routeBuilders.auth.signInWithRedirect(routeBuilders.initiative.create()));
	}

	const [goals, badges] = await Promise.all([getGoals(), getBadges()]);
	const editorData: EntryEditorData = {
		mode: 'create',
		entryType: 'Initiative',
		products: [],
		goals,
		badges
	};

	return { editorData };
};

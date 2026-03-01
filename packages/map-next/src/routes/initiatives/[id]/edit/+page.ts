import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getBadges, getGoals } from '$lib/api/catalog';
import { getPlace } from '$lib/api/places';
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

	const [detailData, goals, badges] = await Promise.all([
		getPlace('initiatives', params.id),
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
};

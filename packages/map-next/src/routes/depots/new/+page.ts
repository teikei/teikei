import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { EntryFeatureCollection } from '$lib/types/entries';
import type { DepotEditorData } from '$lib/types/editor';
import { getAccessToken } from '$lib/utils/localStorage';
import { routeBuilders } from '$lib/utils/routes';

function getFarmOptions(entries: EntryFeatureCollection) {
	return entries.features
		.filter((feature) => feature.properties.type === 'Farm')
		.map((feature) => ({
			id: feature.properties.id,
			name: feature.properties.name
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export const load: PageLoad = async ({ parent }) => {
	if (!getAccessToken()) {
		throw redirect(302, routeBuilders.auth.signInWithRedirect(routeBuilders.depotLegacy.create()));
	}

	const { entries } = await parent();
	const editorData: DepotEditorData = {
		mode: 'create',
		farmOptions: getFarmOptions(entries)
	};

	return { depotEditorData: editorData };
};

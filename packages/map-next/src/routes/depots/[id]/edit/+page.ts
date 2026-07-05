import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDepotEntry } from '$lib/api/entry-details';
import { getAccessToken } from '$lib/utils/localStorage';
import { routeBuilders } from '$lib/utils/routes';
import type { EntryFeatureCollection } from '$lib/types/entries';
import type { DepotEditorData } from '$lib/types/editor';

function getFarmOptions(entries: EntryFeatureCollection) {
	return entries.features
		.filter((feature) => feature.properties.type === 'Farm')
		.map((feature) => ({
			id: feature.properties.id,
			name: feature.properties.name
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export const load: PageLoad = async ({ params, parent }) => {
	if (!getAccessToken()) {
		throw redirect(
			302,
			routeBuilders.auth.signInWithRedirect(routeBuilders.depotLegacy.edit(params.id))
		);
	}

	try {
		const { entries } = await parent();
		const detailData = await getDepotEntry(params.id);
		const editorData: DepotEditorData = {
			mode: 'edit',
			farmOptions: getFarmOptions(entries)
		};

		return { depotDetailData: detailData, depotEditorData: editorData };
	} catch {
		// Render the designed error state in the drawer instead of bubbling to
		// SvelteKit's error page (the app also runs embedded in host pages).
		return { loadError: true };
	}
};

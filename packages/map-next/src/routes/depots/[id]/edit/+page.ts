import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDepotEntry } from '$lib/api/entry-details';
import { getAccessToken } from '$lib/utils/localStorage';
import { loadCatching } from '$lib/utils/load-error';
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

export const load: PageLoad = ({ params, parent }) => {
	if (!getAccessToken()) {
		throw redirect(
			302,
			routeBuilders.auth.signInWithRedirect(routeBuilders.depotLegacy.edit(params.id))
		);
	}

	return loadCatching(routeBuilders.depotLegacy.edit(params.id), async () => {
		const { entries } = await parent();
		const detailData = await getDepotEntry(params.id);
		// TODO(feature 2): split into owned vs. all farm options; all farms are
		// offered unrestricted here until the edit-mode ownership split lands.
		const allFarmOptions = getFarmOptions(entries);
		const editorData: DepotEditorData = {
			mode: 'edit',
			farmOptions: allFarmOptions,
			allFarmOptions
		};

		return { depotDetailData: detailData, depotEditorData: editorData };
	});
};

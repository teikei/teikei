import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDepotEntry } from '$lib/api/entry-details';
import { getAccessToken } from '$lib/utils/localStorage';
import { getMyEntries } from '$lib/api/entries';
import { loadCatching } from '$lib/utils/load-error';
import { routeBuilders } from '$lib/utils/routes';
import type { EntryFeatureCollection } from '$lib/types/entries';
import type { DepotEditorData, DepotFarmOption } from '$lib/types/editor';

function getFarmOptions(entries: EntryFeatureCollection): DepotFarmOption[] {
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
		const [{ entries }, myEntries, detailData] = await Promise.all([
			parent(),
			getMyEntries(),
			getDepotEntry(params.id)
		]);
		const editorData: DepotEditorData = {
			mode: 'edit',
			farmOptions: getFarmOptions(myEntries),
			allFarmOptions: getFarmOptions(entries)
		};

		return { depotDetailData: detailData, depotEditorData: editorData };
	});
};

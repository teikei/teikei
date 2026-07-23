import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { EntryFeatureCollection } from '$lib/types/entries';
import type { DepotEditorData, DepotFarmOption } from '$lib/types/editor';
import { getAccessToken } from '$lib/utils/localStorage';
import { getMyEntries } from '$lib/api/entries';
import { loadCatching } from '$lib/utils/load-error';
import { parseHashRoute, routeBuilders } from '$lib/utils/routes';

function getFarmOptions(entries: EntryFeatureCollection): DepotFarmOption[] {
	return entries.features
		.filter((feature) => feature.properties.type === 'Farm')
		.map((feature) => ({
			id: feature.properties.id,
			name: feature.properties.name
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export const load: PageLoad = ({ parent, url }) => {
	const presetFarmId = parseHashRoute(url.hash).query.get('farm');

	// Preserve the pre-associated farm across the sign-in round-trip so the
	// editor still opens locked to that farm after authenticating.
	const createTarget = presetFarmId
		? routeBuilders.depot.createForFarm(presetFarmId)
		: routeBuilders.depotLegacy.create();

	if (!getAccessToken()) {
		throw redirect(302, routeBuilders.auth.signInWithRedirect(createTarget));
	}

	return loadCatching(createTarget, async () => {
		// Pre-associated from a farm profile: only that single farm is offered
		// (and the selector is hidden in the editor).
		if (presetFarmId) {
			const { entries } = await parent();
			const presetFarm = entries.features.find(
				(feature) => feature.properties.type === 'Farm' && feature.properties.id === presetFarmId
			);
			const presetFarmOptions = presetFarm
				? [{ id: presetFarm.properties.id, name: presetFarm.properties.name }]
				: [];
			const editorData: DepotEditorData = {
				mode: 'create',
				farmOptions: presetFarmOptions,
				allFarmOptions: presetFarmOptions
			};
			return { depotEditorData: editorData };
		}

		// Farm-selection-first flow: owned farms are the default option source;
		// all farms are offered only once the user opts in to a foreign connection.
		const [myEntries, { entries }] = await Promise.all([getMyEntries(), parent()]);
		const editorData: DepotEditorData = {
			mode: 'create',
			farmOptions: getFarmOptions(myEntries),
			allFarmOptions: getFarmOptions(entries)
		};

		return { depotEditorData: editorData };
	});
};

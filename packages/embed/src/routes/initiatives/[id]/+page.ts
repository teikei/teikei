import type { PageLoad } from './$types';
import { getMainEntry } from '$lib/api/entry-details';
import { loadCatching } from '$lib/utils/load-error';
import { routeBuilders } from '$lib/utils/routes';

export const load: PageLoad = ({ params }) =>
	loadCatching(
		routeBuilders.initiative.detail(params.id),
		async () => {
			const detailData = await getMainEntry('initiatives', params.id);
			return { detailData, detailType: 'Initiative' as const };
		},
		{ detailType: 'Initiative' as const }
	);

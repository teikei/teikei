import type { PageLoad } from './$types';
import { getMainEntry } from '$lib/api/entry-details';
import { loadCatching } from '$lib/utils/load-error';
import { routeBuilders } from '$lib/utils/routes';

export const load: PageLoad = ({ params }) =>
	loadCatching(
		routeBuilders.farm.detail(params.id),
		async () => {
			const detailData = await getMainEntry('farms', params.id);
			return { detailData, detailType: 'Farm' as const };
		},
		{ detailType: 'Farm' as const }
	);

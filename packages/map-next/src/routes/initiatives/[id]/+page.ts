import type { PageLoad } from './$types';
import { getMainEntry } from '$lib/api/entry-details';

export const load: PageLoad = async ({ params }) => {
	const detailData = await getMainEntry('initiatives', params.id);
	return { detailData, detailType: 'Initiative' as const };
};

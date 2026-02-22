import type { PageLoad } from './$types';
import { getPlace } from '$lib/utils/places';

export const load: PageLoad = async ({ params }) => {
	const detailData = await getPlace('initiatives', params.id);
	return { detailData, detailType: 'Initiative' as const };
};

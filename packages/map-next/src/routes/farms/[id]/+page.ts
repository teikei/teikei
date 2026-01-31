import type { PageLoad } from './$types';
import { getPlace } from '$lib/api/places';

export const load: PageLoad = async ({ params }) => {
	const detailData = await getPlace('farms', params.id);
	return { detailData, detailType: 'Farm' as const };
};

import type { PageLoad } from './$types';
import { geocodeLocationId } from '$lib/api/discovery';

export const load: PageLoad = async ({ params }) => {
	const geocodeResult = await geocodeLocationId(params.id);

	return {
		discoveryFocus: {
			kind: 'location' as const,
			id: params.id,
			latitude: geocodeResult.latitude,
			longitude: geocodeResult.longitude
		}
	};
};

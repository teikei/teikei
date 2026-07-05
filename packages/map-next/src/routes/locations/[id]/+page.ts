import type { PageLoad } from './$types';
import { geocodeLocationId } from '$lib/api/discovery';
import { loadCatching } from '$lib/utils/load-error';
import { routeBuilders } from '$lib/utils/routes';

export const load: PageLoad = ({ params }) =>
	loadCatching(routeBuilders.discovery.location(params.id), async () => {
		const geocodeResult = await geocodeLocationId(params.id);

		return {
			discoveryFocus: {
				kind: 'location' as const,
				id: params.id,
				latitude: geocodeResult.latitude,
				longitude: geocodeResult.longitude
			}
		};
	});

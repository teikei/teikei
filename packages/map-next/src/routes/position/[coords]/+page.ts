import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

function parseCoordinates(coords: string): { latitude: number; longitude: number } | null {
	const [latRaw, lonRaw] = coords.split(',');
	if (!latRaw || !lonRaw) {
		return null;
	}

	const latitude = Number.parseFloat(latRaw);
	const longitude = Number.parseFloat(lonRaw);

	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
		return null;
	}

	return { latitude, longitude };
}

export const load: PageLoad = async ({ params }) => {
	const parsed = parseCoordinates(params.coords);
	if (!parsed) {
		throw error(404, 'Invalid position coordinates');
	}

	return {
		discoveryFocus: {
			kind: 'position' as const,
			coords: params.coords,
			latitude: parsed.latitude,
			longitude: parsed.longitude
		}
	};
};

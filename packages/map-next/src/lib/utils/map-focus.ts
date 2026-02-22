import type { FlyToOptions } from 'maplibre-gl';
import type { EntryFeature } from '$lib/types/entries';
import { MAP_SIDEBAR_WIDTH_PX } from '$lib/config/layout';

interface BuildEntryFlyToOptions {
	offset?: [number, number];
	minZoom?: number;
	duration?: number;
	sidebarWidth?: number;
}

const DEFAULT_MIN_ZOOM = 10;
const DEFAULT_DURATION_MS = 1000;

/**
 * Builds consistent flyTo options for focusing an entry while accounting for the sidebar.
 */
export function buildEntryFlyToOptions(
	feature: EntryFeature,
	currentZoom: number,
	options: BuildEntryFlyToOptions = {}
): FlyToOptions {
	const [lng, lat] = feature.geometry.coordinates;
	const sidebarWidth = options.sidebarWidth ?? MAP_SIDEBAR_WIDTH_PX;

	return {
		center: [lng, lat],
		zoom: Math.max(currentZoom, options.minZoom ?? DEFAULT_MIN_ZOOM),
		offset: options.offset ?? [sidebarWidth / 2, 0],
		duration: options.duration ?? DEFAULT_DURATION_MS
	};
}

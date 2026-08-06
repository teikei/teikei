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
 * Computes the flyTo `offset` that keeps a focused point clear of the sidebar.
 *
 * On desktop the sidebar floats on the left, so the point is shifted right into
 * the visible area. On mobile the sidebar is a bottom sheet covering the lower
 * half of the viewport, so the point is instead lifted into the centre of the
 * upper half where it stays visible above a half-height sheet.
 */
export function getSidebarFocusOffset(params: {
	isMobile: boolean;
	viewportHeight: number;
	sidebarWidth?: number;
}): [number, number] {
	const { isMobile, viewportHeight, sidebarWidth = MAP_SIDEBAR_WIDTH_PX } = params;
	if (isMobile) {
		return [0, -Math.round(viewportHeight / 4)];
	}
	return [sidebarWidth / 2, 0];
}

/**
 * Builds consistent flyTo options for focusing a point while accounting for the sidebar.
 */
export function buildFlyToOptions(
	coordinates: number[],
	currentZoom: number,
	options: BuildEntryFlyToOptions = {}
): FlyToOptions {
	const [lng, lat] = coordinates;
	const sidebarWidth = options.sidebarWidth ?? MAP_SIDEBAR_WIDTH_PX;

	return {
		center: [lng, lat],
		zoom: Math.max(currentZoom, options.minZoom ?? DEFAULT_MIN_ZOOM),
		offset: options.offset ?? [sidebarWidth / 2, 0],
		duration: options.duration ?? DEFAULT_DURATION_MS
	};
}

/**
 * Builds consistent flyTo options for focusing an entry while accounting for the sidebar.
 */
export function buildEntryFlyToOptions(
	feature: EntryFeature,
	currentZoom: number,
	options: BuildEntryFlyToOptions = {}
): FlyToOptions {
	return buildFlyToOptions(feature.geometry.coordinates, currentZoom, options);
}

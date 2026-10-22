import { untrack } from 'svelte';
import type { CameraOptions, Map as MaplibreMap } from 'maplibre-gl';

export interface PreDetailCameraSources {
	map: () => MaplibreMap | undefined;
	isDetailOpen: () => boolean;
	duration: number;
}

export interface PreDetailCamera {
	/** Snapshot the current viewport, unless a detail is already open. */
	remember(): void;
	/** Fly back to the remembered viewport, if any. */
	restore(): void;
}

/**
 * Remembers the browsing viewport from before a detail view opened, so the
 * slim-header "back" affordance can restore it (F12.3); a plain close leaves the
 * camera put. Must be called during component initialization (it registers an
 * `$effect`).
 */
export function createPreDetailCamera(sources: PreDetailCameraSources): PreDetailCamera {
	let camera: CameraOptions | null = null;

	function remember() {
		const map = sources.map();
		if (!map || sources.isDetailOpen()) return;
		const center = map.getCenter();
		camera = {
			center: [center.lng, center.lat],
			zoom: map.getZoom(),
			bearing: map.getBearing(),
			pitch: map.getPitch()
		};
	}

	$effect(() => {
		const map = sources.map();
		if (!map) return;

		// Capture the initial camera, so a search-opened detail with no prior map
		// movement can still restore on Back. Untracked, so this runs once per map
		// rather than on every detail change.
		untrack(remember);

		// Track the last settled browsing camera too, so a detail reached by a
		// route-only path (search suggestion, deep link after browsing) can restore
		// it. The detail-open fly-to settles with the detail already open, so it
		// does not overwrite this.
		map.on('moveend', remember);
		map.on('zoomend', remember);
		return () => {
			map.off('moveend', remember);
			map.off('zoomend', remember);
		};
	});

	return {
		remember,
		restore() {
			const map = sources.map();
			if (!map || !camera) return;
			map.flyTo({ ...camera, duration: sources.duration });
			camera = null;
		}
	};
}

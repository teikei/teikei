import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Map as MaplibreMap } from 'maplibre-gl';
import { createPreDetailCamera, type PreDetailCamera } from './pre-detail-camera.svelte';

function fakeMap() {
	const listeners = new Map<string, () => void>();
	let lng = 0;
	return {
		moveTo(nextLng: number) {
			lng = nextLng;
			listeners.get('moveend')?.();
		},
		getCenter: () => ({ lng, lat: 0 }),
		getZoom: () => 5,
		getBearing: () => 0,
		getPitch: () => 0,
		on: (event: string, fn: () => void) => listeners.set(event, fn),
		off: (event: string) => listeners.delete(event),
		flyTo: vi.fn()
	};
}

describe('createPreDetailCamera', () => {
	let map: ReturnType<typeof fakeMap>;
	let isDetailOpen = $state(false);
	let camera: PreDetailCamera;
	let cleanup: () => void;

	beforeEach(() => {
		map = fakeMap();
		isDetailOpen = false;
		cleanup = $effect.root(() => {
			camera = createPreDetailCamera({
				map: () => map as unknown as MaplibreMap,
				isDetailOpen: () => isDetailOpen,
				duration: 1000
			});
		});
		flushSync();
	});

	afterEach(() => cleanup());

	it('restores the last browsing viewport once, ignoring moves while a detail is open', () => {
		map.moveTo(7);
		isDetailOpen = true;
		map.moveTo(9);

		camera.restore();
		camera.restore();

		expect(map.flyTo).toHaveBeenCalledTimes(1);
		expect(map.flyTo).toHaveBeenCalledWith(
			expect.objectContaining({ center: [7, 0], zoom: 5, duration: 1000 })
		);
	});

	it('restores the initial viewport when the map never moved', () => {
		isDetailOpen = true;
		camera.restore();

		expect(map.flyTo).toHaveBeenCalledWith(expect.objectContaining({ center: [0, 0] }));
	});
});

import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Map from './Map.svelte';

describe('Map component', () => {
	it('should render maplibre legend', async () => {
		// Map component now contains the map functionality
		const mockEntries = {
			type: 'FeatureCollection' as const,
			features: []
		};
		
		render(Map, { entries: mockEntries });

		const mapLibreLegend = page.getByText('MapLibre');
		await expect.element(mapLibreLegend).toBeInTheDocument();
	});
});

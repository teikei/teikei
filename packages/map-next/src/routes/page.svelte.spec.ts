import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render maplibre legend.', async () => {
		render(Page);

		const mapLibreLegend = page.getByText('MapLibre');
		await expect.element(mapLibreLegend).toBeInTheDocument();
	});
});

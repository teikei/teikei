import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render without error', async () => {
		// +page.svelte is now a placeholder - Map is rendered in +layout.svelte
		const { container } = render(Page);
		expect(container).toBeDefined();
	});
});

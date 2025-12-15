import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		// Configure as a pure client-side SPA
		adapter: adapter({
			// Default: true. Set to false for SPA mode without prerendering
			fallback: 'index.html',
			// Emit prerendered pages during build
			pages: 'build',
			// Directory for static assets
			assets: 'build'
		})
	}
};

export default config;

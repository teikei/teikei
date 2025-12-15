import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		devtoolsJson(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	server: { port: 3000 },
	test: {
		expect: { requireAssertions: true },
		// Pure client-side testing only
		name: 'client',
		environment: 'browser',
		browser: {
			enabled: true,
			provider: 'playwright',
			instances: [{ browser: 'chromium' }]
		},
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./vitest-setup-client.ts']
	}
});

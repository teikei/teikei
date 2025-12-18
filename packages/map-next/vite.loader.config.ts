/**
 * Vite configuration for building the SvelteKit app loader.
 *
 * This creates a stable loader.js file that can dynamically load
 * the full SvelteKit app with hash routing.
 *
 * Run with: npm run build:loader
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		outDir: 'build',
		emptyOutDir: false, // Don't delete the SvelteKit build output
		lib: {
			entry: resolve(__dirname, 'src/lib/embeds/main.ts'),
			name: 'TeikeiAppLoader',
			formats: ['iife'],
			fileName: () => 'main.js'
		},
		rollupOptions: {
			output: {
				entryFileNames: 'main.js'
			}
		},
		sourcemap: true,
		minify: true
	}
});

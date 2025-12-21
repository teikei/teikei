import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite configuration for building standalone widgets.
 *
 * This config is designed to be invoked by scripts/build-widgets.js which:
 * - Sets WIDGET_ENTRY and WIDGET_NAME environment variables
 * - Builds each widget separately for proper CSS file naming
 *
 * Usage:
 *   npm run build:widgets
 *
 * Output:
 *   build/widgets/
 *     ├── search-widget.js
 *     ├── search-widget.css
 *     └── ... (other widgets)
 */

const widgetEntry = process.env.WIDGET_ENTRY;
const widgetName = process.env.WIDGET_NAME;
const emptyOutDir = process.env.WIDGET_EMPTY_OUTDIR === 'true';

export default defineConfig(({ command }) => {
	if (command === 'build' && (!widgetEntry || !widgetName)) {
		console.error('This config should be invoked via: npm run build:widgets');
		console.error('Missing WIDGET_ENTRY or WIDGET_NAME environment variable.');
		process.exit(1);
	}

	return {
		plugins: [
			tailwindcss(),
			svelte({
				compilerOptions: {
					customElement: false
				}
			})
		],
		build: {
			outDir: 'build/widgets',
			emptyOutDir,
			lib: {
				entry: widgetEntry ?? '',
				formats: ['es'],
				fileName: () => `${widgetName}.js`
			},
			rollupOptions: {
				output: {
					assetFileNames: (assetInfo) => {
						if (assetInfo.name?.endsWith('.css')) {
							return `${widgetName}.css`;
						}
						return 'assets/[name]-[hash][extname]';
					}
				}
			}
		},
		resolve: {
			alias: {
				$lib: resolve(__dirname, 'src/lib')
			}
		}
	};
});

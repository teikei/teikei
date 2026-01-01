#!/usr/bin/env node
/**
 * Build script for widgets.
 *
 * This script:
 * 1. Discovers all widget entry points in src/lib/widgets/
 * 2. Builds each widget separately to ensure proper CSS file naming
 * 3. Copies the widget demo HTML to the build directory
 */

import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, statSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const WIDGETS_BUILD_DIR = join(ROOT_DIR, 'build', 'widgets');
const WIDGETS_SRC_DIR = join(ROOT_DIR, 'src', 'widgets');

/**
 * Discover all widget entry points:
 * - *.ts files directly in src/widgets/
 * - index.ts files in subdirectories of src/widgets/
 */
function discoverWidgets() {
	const entries = readdirSync(WIDGETS_SRC_DIR);
	const widgets = [];

	for (const entry of entries) {
		const entryPath = join(WIDGETS_SRC_DIR, entry);
		const stat = statSync(entryPath);

		if (stat.isDirectory()) {
			// Check for index.ts in subdirectory
			const indexPath = join(entryPath, 'index.ts');
			if (existsSync(indexPath)) {
				widgets.push({
					name: entry,
					path: indexPath
				});
			}
		} else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
			// Direct .ts file in widgets directory
			widgets.push({
				name: basename(entry, '.ts'),
				path: entryPath
			});
		}
	}

	return widgets;
}

/**
 * Build a single widget using Vite
 */
function buildWidget(widget, isFirst) {
	console.log(`\nBuilding widget: ${widget.name}`);

	// Set environment variable for the widget entry point
	const env = {
		...process.env,
		WIDGET_ENTRY: widget.path,
		WIDGET_NAME: widget.name,
		// Only empty the output dir on first build
		WIDGET_EMPTY_OUTDIR: isFirst ? 'true' : 'false'
	};

	execSync('npx vite build --config vite.widget.config.ts', {
		cwd: ROOT_DIR,
		stdio: 'inherit',
		env
	});

	// Rename the CSS file from map.css to widget-name.css
	const mapCssPath = join(WIDGETS_BUILD_DIR, 'map.css');
	const widgetCssPath = join(WIDGETS_BUILD_DIR, `${widget.name}.css`);

	if (existsSync(mapCssPath)) {
		renameSync(mapCssPath, widgetCssPath);
		console.log(`Renamed map.css to ${widget.name}.css`);
	}
}

/**
 * Copy demo HTML page to build directory
 */
function copyDemoPage() {
	const demoSrc = join(ROOT_DIR, 'src', 'lib', 'preview', 'widgets-demo.html');
	const demoDest = join(WIDGETS_BUILD_DIR, 'index.html');
	copyFileSync(demoSrc, demoDest);

	const loaderSrc = join(ROOT_DIR, 'static', 'teikei-loader.js');
	const loaderDest = join(WIDGETS_BUILD_DIR, 'teikei-loader.js');
	copyFileSync(loaderSrc, loaderDest);

	console.log(`\nCopied index.html demo page and loader.`);
}

function main() {
	console.log('Building widgets...\n');

	// Ensure build directory exists
	if (!existsSync(WIDGETS_BUILD_DIR)) {
		mkdirSync(WIDGETS_BUILD_DIR, { recursive: true });
	}

	// Discover widgets
	const widgets = discoverWidgets();

	if (widgets.length === 0) {
		console.log('No widgets found in src/lib/widgets/');
		process.exit(0);
	}

	console.log(`Found ${widgets.length} widget(s): ${widgets.map((w) => w.name).join(', ')}`);

	// Build each widget
	widgets.forEach((widget, index) => {
		buildWidget(widget, index === 0);
	});

	// Copy demo page
	copyDemoPage();

	console.log('\n✨ Widget build complete!');
}

main();

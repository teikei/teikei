#!/usr/bin/env node
/**
 * Build script for widgets.
 *
 * This script:
 * 1. Discovers all widget entry points in src/widgets/
 * 2. Builds each widget separately to ensure proper CSS file naming
 * 3. Copies the widget demo HTML to the build directory
 */

import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const WIDGETS_BUILD_DIR = join(ROOT_DIR, 'build', 'widgets');
const WIDGETS_SRC_DIR = join(ROOT_DIR, 'src', 'lib', 'widgets');

/**
 * Discover all widget entry points (*.ts files in src/lib/widgets/)
 */
function discoverWidgets() {
	const files = readdirSync(WIDGETS_SRC_DIR);
	return files
		.filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
		.map((f) => ({
			name: basename(f, '.ts'),
			path: join(WIDGETS_SRC_DIR, f)
		}));
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
	console.log(`\nCopied index.html demo page to ${demoDest}`);
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

#!/usr/bin/env node
/**
 * Builds each widget in a separate Vite pass — a single multi-entry build would
 * emit one shared CSS file, so per-widget CSS naming needs per-widget builds.
 */

import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, statSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const WIDGETS_BUILD_DIR = join(ROOT_DIR, 'build', 'widgets');
const WIDGETS_SRC_DIR = join(ROOT_DIR, 'src', 'widgets');

// Entry points are `*.ts` directly in src/widgets/, or `index.ts` one level down.
function discoverWidgets() {
	const entries = readdirSync(WIDGETS_SRC_DIR);
	const widgets = [];

	for (const entry of entries) {
		const entryPath = join(WIDGETS_SRC_DIR, entry);
		const stat = statSync(entryPath);

		if (stat.isDirectory()) {
			const indexPath = join(entryPath, 'index.ts');
			if (existsSync(indexPath)) {
				widgets.push({
					name: entry,
					path: indexPath
				});
			}
		} else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
			widgets.push({
				name: basename(entry, '.ts'),
				path: entryPath
			});
		}
	}

	return widgets;
}

function buildWidget(widget, isFirst) {
	console.log(`\nBuilding widget: ${widget.name}`);

	const env = {
		...process.env,
		WIDGET_ENTRY: widget.path,
		WIDGET_NAME: widget.name,
		// Only the first build may empty the shared output dir.
		WIDGET_EMPTY_OUTDIR: isFirst ? 'true' : 'false'
	};

	execSync('npx vite build --config vite.widget.config.ts', {
		cwd: ROOT_DIR,
		stdio: 'inherit',
		env
	});

	// vite.widget.config.ts always emits `map.css`, whatever the entry is named.
	const mapCssPath = join(WIDGETS_BUILD_DIR, 'map.css');
	const widgetCssPath = join(WIDGETS_BUILD_DIR, `${widget.name}.css`);

	if (existsSync(mapCssPath)) {
		renameSync(mapCssPath, widgetCssPath);
		console.log(`Renamed map.css to ${widget.name}.css`);
	}
}

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

	if (!existsSync(WIDGETS_BUILD_DIR)) {
		mkdirSync(WIDGETS_BUILD_DIR, { recursive: true });
	}

	const widgets = discoverWidgets();

	if (widgets.length === 0) {
		console.log('No widgets found in src/lib/widgets/');
		process.exit(0);
	}

	console.log(`Found ${widgets.length} widget(s): ${widgets.map((w) => w.name).join(', ')}`);

	widgets.forEach((widget, index) => {
		buildWidget(widget, index === 0);
	});

	copyDemoPage();

	console.log('\nWidget build complete!');
}

main();

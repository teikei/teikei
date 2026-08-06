#!/usr/bin/env node
/**
 * Post-build step for the embed bundle: rewrites the hashed asset names and the
 * generated `__sveltekit_XXXXXX` global to stable ones, so a host page can point
 * at fixed script URLs and keep its init code unchanged across builds.
 */

import { readFileSync, writeFileSync, readdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = join(__dirname, '..', 'build');
const SRC_DIR = join(__dirname, '..', 'src');

const STABLE_SVELTEKIT_VAR = '__sveltekit_teikei';

const appDir = join(BUILD_DIR, '_app', 'immutable');
const assetsDir = join(appDir, 'assets');

function findFile(dir, pattern) {
	try {
		const files = readdirSync(dir);
		return files.find((f) => f.match(pattern));
	} catch {
		return null;
	}
}

function main() {
	console.log('Building embed bundle...');

	const bundleFile = findFile(appDir, /^bundle\.[^.]+\.js$/);
	if (!bundleFile) {
		console.error('Could not find bundle JS file');
		process.exit(1);
	}

	console.log(`Found bundle file: ${bundleFile}`);
	const bundlePath = join(appDir, bundleFile);
	let bundleContent = readFileSync(bundlePath, 'utf-8');

	const sveltekitVarPattern = /__sveltekit_[a-z0-9]+/g;
	const matches = bundleContent.match(sveltekitVarPattern);

	if (matches && matches.length > 0) {
		const originalVar = matches[0];
		console.log(`Replacing ${originalVar} with ${STABLE_SVELTEKIT_VAR}`);
		bundleContent = bundleContent.replace(sveltekitVarPattern, STABLE_SVELTEKIT_VAR);
	} else {
		console.warn('No __sveltekit_XXXXX variable found in bundle');
	}

	const mainJsPath = join(BUILD_DIR, 'main.js');
	writeFileSync(mainJsPath, bundleContent);
	console.log(`Created ${mainJsPath}`);

	const cssFile = findFile(assetsDir, /\.css$/);
	if (cssFile) {
		const cssPath = join(assetsDir, cssFile);
		const mainCssPath = join(BUILD_DIR, 'main.css');
		copyFileSync(cssPath, mainCssPath);
		console.log(`Created ${mainCssPath}`);
	} else {
		console.warn('No CSS file found');
	}

	const embedTemplatePath = join(SRC_DIR, 'lib', 'preview', 'embed-demo.html');
	let embedContent = readFileSync(embedTemplatePath, 'utf-8');
	embedContent = embedContent.replace(sveltekitVarPattern, STABLE_SVELTEKIT_VAR);

	const indexPath = join(BUILD_DIR, 'index.html');
	writeFileSync(indexPath, embedContent);
	console.log(`Created ${indexPath}`);
	console.log('Embed bundle ready!');
}

main();

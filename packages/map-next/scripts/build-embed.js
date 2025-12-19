#!/usr/bin/env node
/**
 * Post-build script for the embed bundle.
 *
 * This script:
 * 1. Copies the bundle JS and CSS to stable filenames (main.js, main.css)
 * 2. Replaces the generated __sveltekit_XXXXXX variable name with a stable one (__sveltekit_teikei)
 * 3. Copies the embed.html template to build/index.html
 *
 * This ensures the embedded app can be loaded with stable script URLs and
 * the initialization code in the host page doesn't need to change on each build.
 */

import { readFileSync, writeFileSync, readdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = join(__dirname, '..', 'build');
const SRC_DIR = join(__dirname, '..', 'src');

// Stable name for the SvelteKit global variable
const STABLE_SVELTEKIT_VAR = '__sveltekit_teikei';

function findBundleFile(pattern) {
	const appDir = join(BUILD_DIR, '_app', 'immutable');
	try {
		const files = readdirSync(appDir);
		return files.find((f) => f.match(pattern));
	} catch {
		return null;
	}
}

function findCssFile() {
	const assetsDir = join(BUILD_DIR, '_app', 'immutable', 'assets');
	try {
		const files = readdirSync(assetsDir);
		return files.find((f) => f.endsWith('.css'));
	} catch {
		return null;
	}
}

function main() {
	console.log('📦 Building embed bundle...');

	// Find and copy the bundle JS
	const bundleFile = findBundleFile(/^bundle\.[^.]+\.js$/);
	if (!bundleFile) {
		console.error('❌ Could not find bundle JS file');
		process.exit(1);
	}

	const bundlePath = join(BUILD_DIR, '_app', 'immutable', bundleFile);
	let bundleContent = readFileSync(bundlePath, 'utf-8');

	// Find and replace the __sveltekit_XXXXX variable with stable name
	// The pattern matches __sveltekit_ followed by alphanumeric characters
	const sveltekitVarPattern = /__sveltekit_[a-z0-9]+/g;
	const matches = bundleContent.match(sveltekitVarPattern);

	if (matches && matches.length > 0) {
		const originalVar = matches[0];
		console.log(`🔄 Replacing ${originalVar} with ${STABLE_SVELTEKIT_VAR}`);
		bundleContent = bundleContent.replace(sveltekitVarPattern, STABLE_SVELTEKIT_VAR);
	} else {
		console.warn('⚠️ No __sveltekit_XXXXX variable found in bundle');
	}

	// Write the modified bundle
	const mainJsPath = join(BUILD_DIR, 'main.js');
	writeFileSync(mainJsPath, bundleContent);
	console.log(`✅ Created ${mainJsPath}`);

	// Find and copy the CSS file
	const cssFile = findCssFile();
	if (cssFile) {
		const cssPath = join(BUILD_DIR, '_app', 'immutable', 'assets', cssFile);
		const mainCssPath = join(BUILD_DIR, 'main.css');
		copyFileSync(cssPath, mainCssPath);
		console.log(`✅ Created ${mainCssPath}`);
	} else {
		console.warn('⚠️ No CSS file found');
	}

	// Read and process embed.html template
	const embedTemplatePath = join(SRC_DIR, 'embed.html');
	let embedContent = readFileSync(embedTemplatePath, 'utf-8');

	// Replace any existing __sveltekit_XXXXX references with stable name
	embedContent = embedContent.replace(sveltekitVarPattern, STABLE_SVELTEKIT_VAR);

	// Write the processed embed.html
	const indexPath = join(BUILD_DIR, 'index.html');
	writeFileSync(indexPath, embedContent);
	console.log(`✅ Created ${indexPath}`);

	console.log('🎉 Embed bundle ready!');
}

main();

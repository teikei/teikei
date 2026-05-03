import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { designThemes, getDesignTheme, defaultDesignThemeId } from '../src/lib/design/themes.js';

function renderVars(vars) {
	return Object.entries(vars)
		.map(([name, value]) => `\t--${name}: ${value};`)
		.join('\n');
}

function renderRule(selector: string, vars: any) {
	return `${selector} {\n${renderVars(vars)}\n}`;
}

export function renderThemeVarsCss(themes, defaultTheme) {
	const chunks = [
		'/* This file is generated from src/lib/design/themes/*.ts. */',
		'/* Run `npm run design:css` in packages/map-next after changing design tokens. */',
		renderRule(':root', defaultTheme.cssVars),
		renderRule(':host', defaultTheme.cssVars)
	];

	for (const theme of themes) {
		chunks.push(renderRule(`[data-theme='${theme.id}']`, theme.cssVars));
		chunks.push(renderRule(`:root[data-theme='${theme.id}']`, theme.cssVars));
		chunks.push(renderRule(`:host([data-theme='${theme.id}'])`, theme.cssVars));
	}

	return `${chunks.join('\n\n')}\n`;
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const sourceRoot = resolve(packageRoot, 'src/lib/design');
const outputPath = resolve(sourceRoot, 'generated/theme-vars.css');

const themes = Object.values(designThemes);
const defaultTheme = getDesignTheme(defaultDesignThemeId);
const css = renderThemeVarsCss(themes, defaultTheme);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, css);

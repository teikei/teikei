import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { defaultDesignThemeId, designThemes, getDesignThemeId } from './themes.js';

const rawColorPattern = /#[0-9a-fA-F]{6,8}\b|\boklch\(|\brgba?\(|\bhsla?\(/;
const tailwindPalettePattern =
	/\b(?:bg|text|border|ring|outline|decoration|from|via|to|accent|caret|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{2,3})?(?:\/\d+)?\b/;
const ignoredStyleCheckDirs = [join(process.cwd(), 'src/lib/components/ui')];

async function findFiles(dir: string, extension: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map((entry) => {
			const path = join(dir, entry.name);

			if (entry.isDirectory()) {
				return findFiles(path, extension);
			}

			return Promise.resolve(entry.name.endsWith(extension) ? [path] : []);
		})
	);

	return files.flat();
}

describe('design themes', () => {
	it('keeps CSS variables as the editable token source', async () => {
		const source = await readFile(join(process.cwd(), 'src/lib/design/theme-vars.css'), 'utf8');

		expect(source).not.toContain('generated');
		expect(source).toContain(":root,\n:host,\n[data-theme='teikei']");
		expect(source).toContain("[data-theme='client-demo']");
		expect(source).toContain('--map-base: var(--base-color-map-base);');
		expect(source).toContain('--map-font-regular: var(--base-font-roboto-regular);');
	});

	it('validates configured theme ids against the registry', () => {
		expect(getDesignThemeId('client-demo')).toBe('client-demo');
		expect(getDesignThemeId('unknown')).toBe(defaultDesignThemeId);
		expect(Object.keys(designThemes)).toEqual(['teikei', 'client-demo']);
	});

	it('keeps authored component styles off raw colors and Tailwind default palettes', async () => {
		const componentFiles = await findFiles(join(process.cwd(), 'src'), '.svelte');
		const violations: string[] = [];

		for (const file of componentFiles) {
			if (ignoredStyleCheckDirs.some((dir) => file.startsWith(`${dir}/`))) {
				continue;
			}

			const source = await readFile(file, 'utf8');

			if (
				source.includes('var(--base-') ||
				rawColorPattern.test(source) ||
				tailwindPalettePattern.test(source)
			) {
				violations.push(file.replace(`${process.cwd()}/`, ''));
			}
		}

		expect(violations).toEqual([]);
	});
});

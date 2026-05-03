import { clientDemoTheme } from './themes/client-demo.js';
import { teikeiTheme } from './themes/teikei.js';

export interface DesignTheme {
	readonly id: string;
	readonly label: string;
	readonly description: string;
	readonly cssVars: Record<string, string>;
	readonly map: MapDesignTokens;
}

export interface MapDesignTokens {
	readonly baseColor: string;
	readonly fontRegular: string;
	readonly fontBold: string;
}

export const designThemes = {
	teikei: teikeiTheme,
	'client-demo': clientDemoTheme
} as const satisfies Record<string, DesignTheme>;

export type DesignThemeId = keyof typeof designThemes;

export const defaultDesignThemeId = 'teikei' satisfies DesignThemeId;

export function isDesignThemeId(value: string | null | undefined): value is DesignThemeId {
	return !!value && Object.hasOwn(designThemes, value);
}

export function getDesignTheme(themeId: string | null | undefined): DesignTheme {
	if (isDesignThemeId(themeId)) {
		return designThemes[themeId];
	}

	return designThemes[defaultDesignThemeId];
}

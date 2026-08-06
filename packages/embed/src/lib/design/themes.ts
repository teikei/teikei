export interface DesignThemeOption {
	readonly id: string;
	readonly label: string;
	readonly description: string;
}

export interface MapDesignTokens {
	readonly baseColor: string;
	readonly primaryPlaceColor: string;
	readonly primaryClusterColor: string;
	readonly secondaryPlaceColor: string;
	readonly networkLineColor: string;
	readonly networkLineWidth: number;
	readonly mapPopupColor: string;
	readonly fontRegular: string;
	readonly fontBold: string;
}

export const designThemes = {
	teikei: {
		id: 'teikei',
		label: 'Teikei',
		description: 'Default Teikei theme used for the standalone app and embeds.'
	},
	'client-demo': {
		id: 'client-demo',
		label: 'Client Demo',
		description: 'Example client override proving that one bundle can expose multiple token sets.'
	}
} as const satisfies Record<string, DesignThemeOption>;

export type DesignThemeId = keyof typeof designThemes;

export const defaultDesignThemeId = 'teikei' satisfies DesignThemeId;

export function isDesignThemeId(value: string | null | undefined): value is DesignThemeId {
	return !!value && Object.hasOwn(designThemes, value);
}

export function getDesignThemeId(themeId: string | null | undefined): DesignThemeId {
	return isDesignThemeId(themeId) ? themeId : defaultDesignThemeId;
}

export function getDesignThemeOption(themeId: string | null | undefined): DesignThemeOption {
	return designThemes[getDesignThemeId(themeId)];
}

function readCssVariable(styles: CSSStyleDeclaration, name: string): string {
	const value = styles.getPropertyValue(name).trim();

	if (!value) {
		throw new Error(`Missing design token: ${name}`);
	}

	return value;
}

export function readMapDesignTokens(element: Element): MapDesignTokens {
	const styles = getComputedStyle(element);

	return {
		baseColor: readCssVariable(styles, '--map-base'),
		primaryPlaceColor: readCssVariable(styles, '--map-place-primary'),
		primaryClusterColor: readCssVariable(styles, '--map-cluster-primary'),
		secondaryPlaceColor: readCssVariable(styles, '--map-place-secondary'),
		networkLineColor: readCssVariable(styles, '--map-network-line'),
		networkLineWidth: Number.parseFloat(readCssVariable(styles, '--map-network-line-width')),
		mapPopupColor: readCssVariable(styles, '--map-popup'),
		fontRegular: readCssVariable(styles, '--map-font-regular'),
		fontBold: readCssVariable(styles, '--map-font-bold')
	};
}

import { colorful, type StyleBuilderColors, type StyleBuilderOptions } from '@versatiles/style';
import type { StyleSpecification } from 'maplibre-gl';
import chroma from 'chroma-js';
import type { MapDesignTokens } from '$lib/design/themes';

const shadeSteps = [
	50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950
] as const;

type MapShade = (typeof shadeSteps)[number];
type MapColorScale = Record<MapShade, string>;

function createMapColorScale(baseColor: string): MapColorScale {
	const colorScale = chroma
		.scale([
			chroma(baseColor).brighten(2.1).desaturate(0.2),
			baseColor,
			chroma(baseColor).darken(2.1).desaturate(0.2)
		])
		.mode('lab')
		.colors(shadeSteps.length);

	return Object.fromEntries(
		shadeSteps.map((step, index) => [step, colorScale[index]])
	) as MapColorScale;
}

function createDefaultColors(theme: MapDesignTokens): StyleBuilderColors {
	const map = createMapColorScale(theme.baseColor);

	return {
		land: map[450],
		water: map[500],
		glacier: map[400],
		wood: map[400],
		grass: map[400],
		park: map[400],
		parking: map[350],
		foot: map[300],
		cycle: map[300],
		street: map[350],
		streetbg: map[450],
		trunk: map[350],
		trunkbg: map[450],
		motorway: map[350],
		motorwaybg: map[450],
		buildingbg: map[450],
		boundary: map[600],
		disputed: map[600],
		building: map[400],
		residential: map[400],
		commercial: map[400],
		industrial: map[400],
		label: map[850],
		labelHalo: map[400],
		agriculture: map[400],
		rail: map[450],
		subway: map[450],
		waste: map[400],
		burial: map[400],
		sand: map[400],
		rock: map[400],
		leisure: map[400],
		wetland: map[400],
		danger: map[300],

		// Required by StyleBuilderColors but not part of the design yet — these
		// features are not styled deliberately, they just take the base shade.
		symbol: map[500],
		shield: map[500],
		prison: map[500],
		hospital: map[500],
		education: map[500],
		construction: map[500],
		poi: map[500]
	};
}

export function getMapStyle(
	styleOptions: StyleBuilderOptions & {
		theme: MapDesignTokens;
		transitionDuration?: number;
		disableDarkMode?: boolean;
	}
): StyleSpecification {
	const { theme, transitionDuration, ...builderOptions } = styleOptions;

	const style = colorful({
		baseUrl: 'https://tiles.versatiles.org', // TODO: Set-up a CDN instead of using versatiles directly?
		language: 'de', // TODO: make this dynamic, based on embed locale
		colors: createDefaultColors(theme),
		fonts: {
			regular: theme.fontRegular,
			bold: theme.fontBold
		},
		...builderOptions
	});

	if (transitionDuration != null) {
		style.transition = { duration: transitionDuration, delay: 0 };
	}

	return style as StyleSpecification;
}

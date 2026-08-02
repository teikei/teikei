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
		/** Color for land areas on the map. */
		land: map[450],

		/** Color for water bodies like lakes and rivers. */
		water: map[500],

		/** Color for glacier areas, usually shown as white. */
		glacier: map[400],

		/** Color for wooded or forested areas. */
		wood: map[400],

		/** Color for grasslands or open fields. */
		grass: map[400],

		/** Color for parks and recreational areas. */
		park: map[400],

		/** Color used for parking areas. */
		parking: map[350],

		/** Color used for footpaths and pedestrian areas. */
		foot: map[300],

		/** Color used for cycle paths. */
		cycle: map[300],

		/** Color for streets, roads, motorways. */
		street: map[350],

		/** Background color for streets. */
		streetbg: map[450],

		/** Color for trunks. */
		trunk: map[350],

		/** Background color for trunks. */
		trunkbg: map[450],

		/** Color for motorways. */
		motorway: map[350],

		/** Background color for motorways. */
		motorwaybg: map[450],

		/** Background color for buildings. */
		buildingbg: map[450],

		/** Color used for boundaries. */
		boundary: map[600],

		/** Color used for disputed boundaries. */
		disputed: map[600],

		/** Primary color for buildings. */
		building: map[400],

		/** Color used for residential areas. */
		residential: map[400],

		/** Color used for commercial areas. */
		commercial: map[400],

		/** Color used for industrial areas. */
		industrial: map[400],

		/** Primary color used for labels. */
		label: map[850],

		/** Color used for label halos. */
		labelHalo: map[400],

		/** Color used for agriculture areas. */
		agriculture: map[400],

		/** Color used for railways. */
		rail: map[450],

		/** Color used for subways. */
		subway: map[450],

		/** Color used for waste areas. */
		waste: map[400],

		/** Color used for burial and cemetery areas. */
		burial: map[400],

		/** Color used for sand areas like beaches. */
		sand: map[400],

		/** Color used for rocky terrain. */
		rock: map[400],

		/** Color used for leisure areas like parks and gardens. */
		leisure: map[400],

		/** Color used for wetland areas like marshes. */
		wetland: map[400],

		/** Color indicating danger or warning areas. */
		danger: map[300],

		// Placeholder colors for future use - currently not implemented
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

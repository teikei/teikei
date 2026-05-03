import { type StyleBuilderOptions } from '@versatiles/style';
import type { StyleSpecification } from 'maplibre-gl';
import { StyleBuilder } from '@versatiles/style/src/style_builder/style_builder.js';
import type {
	StyleBuilderColors,
	StyleRules,
	StyleRulesOptions
} from '@versatiles/style/src/style_builder/types.js';
import chroma from 'chroma-js';
import { defaultDesignThemeId, designThemes, type MapDesignTokens } from '$lib/design/themes';

const defaultMapTheme = designThemes[defaultDesignThemeId].map;
const shadeSteps = [
	50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950
] as const;

type MapShade = (typeof shadeSteps)[number];
type MapColorScale = Record<MapShade, string>;

function createMapColorScale(baseColor: string): MapColorScale {
	const colorScale = chroma
		.scale([
			chroma(baseColor).brighten(1.8).desaturate(0.3),
			baseColor,
			chroma(baseColor).darken(1.8).desaturate(0.3)
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

/**
 * Custom Teikei StyleBuilder class based on colorful.ts
 */
class TeikeiStyleBuilder extends StyleBuilder {
	public readonly name: string = 'Teikei';

	public defaultFonts;
	public defaultColors: StyleBuilderColors;

	public constructor(theme: MapDesignTokens = defaultMapTheme) {
		super();
		this.defaultFonts = {
			regular: theme.fontRegular,
			bold: theme.fontBold
		};
		this.defaultColors = createDefaultColors(theme);
	}

	protected getStyleRules(options: StyleRulesOptions): StyleRules {
		const { colors, fonts } = options;
		return {
			// background
			background: {
				color: colors.land
			},

			// boundary
			'boundary-{country,state}:outline': {
				color: colors.land.lighten(0.25),
				lineBlur: 1,
				lineCap: 'round',
				lineJoin: 'round'
			},
			'boundary-{country,state}': {
				color: colors.boundary,
				lineCap: 'round',
				lineJoin: 'round',
				lineDasharray: { 7: [1, 0], 10: [2, 2] }
			},
			'boundary-state:outline': {
				size: { 6: 0, 7: 3, 12: 5 },
				opacity: { 6: 0, 7: 0.5, 10: 0.7 }
			},
			'boundary-state': {
				size: { 6: 0, 7: 1.5, 12: 2 },
				opacity: { 6: 0, 7: 0.9, 10: 1 }
			},
			'boundary-country{-disputed,}:outline': {
				size: { 2: 0, 3: 2, 12: 6 },
				opacity: 0.6
			},
			'boundary-country{-disputed,}': {
				size: { 2: 0, 3: 1, 12: 3 }
			},
			'boundary-country-disputed': {
				color: colors.boundary,
				lineDasharray: [2, 2],
				lineCap: 'square'
			},

			// water
			'water-*': {
				color: colors.water,
				lineCap: 'round',
				lineJoin: 'round'
			},
			'water-area': {
				opacity: { 4: 0, 8: 1 }
			},
			'water-area-*': {
				opacity: { 4: 0, 8: 1 }
			},
			'water-{pier,dam}-area': {
				color: colors.land,
				opacity: { 12: 0, 13: 1 }
			},
			'water-pier': {
				color: colors.land
			},
			'water-river': {
				lineWidth: { 9: 0, 10: 3, 15: 5, 17: 9, 18: 20, 20: 60 }
			},
			'water-canal': {
				lineWidth: { 9: 0, 10: 2, 15: 4, 17: 8, 18: 17, 20: 50 }
			},
			'water-stream': {
				lineWidth: { 13: 0, 14: 1, 15: 2, 17: 6, 18: 12, 20: 30 }
			},
			'water-ditch': {
				lineWidth: { 14: 0, 15: 1, 17: 4, 18: 8, 20: 20 }
			},

			// land
			'land-*': {
				color: colors.land
			},
			'land-glacier': {
				color: colors.glacier
			},
			'land-forest': {
				color: colors.wood,
				opacity: { 7: 0, 8: 0.1 }
			},
			'land-grass': {
				color: colors.grass,
				opacity: { 11: 0, 12: 1 }
			},
			'land-{park,garden,vegetation}': {
				color: colors.park,
				opacity: { 11: 0, 12: 1 }
			},
			'land-agriculture': {
				color: colors.agriculture,
				opacity: { 10: 0, 11: 1 }
			},
			'land-residential': {
				color: colors.residential,
				opacity: { 10: 0, 11: 1 }
			},
			'land-commercial': {
				color: colors.commercial,
				opacity: { 10: 0, 11: 1 }
			},
			'land-industrial': {
				color: colors.industrial,
				opacity: { 10: 0, 11: 1 }
			},
			'land-waste': {
				color: colors.waste,
				opacity: { 10: 0, 11: 1 }
			},
			'land-burial': {
				color: colors.burial,
				opacity: { 13: 0, 14: 1 }
			},
			'land-leisure': {
				color: colors.leisure
			},
			'land-rock': {
				color: colors.rock
			},
			'land-sand': {
				color: colors.sand
			},
			'land-wetland': {
				color: colors.wetland
			},

			// site
			'site-dangerarea': {
				color: colors.danger,
				fillOutlineColor: colors.danger,
				opacity: 0.3,
				image: 'basics:pattern-warning'
			},
			'site-{bicycleparking,parking}': {
				color: colors.parking
			},

			// building
			'building:outline': {
				color: colors.buildingbg,
				opacity: { 14: 0, 15: 1 }
			},
			building: {
				color: colors.building,
				opacity: { 14: 0, 15: 1 },
				fillTranslate: [-2, -2]
			},

			// streets and general line styles
			'{tunnel-,bridge-,}street-*:outline': {
				color: colors.streetbg,
				lineJoin: 'round'
			},
			'{tunnel-,bridge-,}street-*': {
				color: colors.street,
				lineJoin: 'round'
			},
			'tunnel-street-*:outline': {
				color: colors.street.darken(0.13)
			},
			'tunnel-street-*': {
				color: colors.street.darken(0.03)
			},
			'bridge-street-*:outline': {
				color: colors.street.darken(0.15)
			},

			// street line caps
			'{tunnel-,}{street,way}-*': {
				lineCap: 'round'
			},
			'{tunnel-,}{street,way}-*:outline': {
				lineCap: 'round'
			},
			'bridge-{street,way}-*': {
				lineCap: 'butt'
			},
			'bridge-{street,way}-*:outline': {
				lineCap: 'butt'
			},

			// motorway and trunk colors
			'{bridge-,}street-motorway{-link,}:outline': {
				color: colors.motorwaybg
			},
			'{bridge-,}street-motorway{-link,}': {
				color: colors.motorway
			},
			'{bridge-,}street-{trunk,primary,secondary}{-link,}:outline': {
				color: colors.trunkbg
			},
			'{bridge-,}street-{trunk,primary,secondary}{-link,}': {
				color: colors.trunk
			},

			// motorway sizes
			'{bridge-,tunnel-,}street-motorway:outline': {
				size: { 5: 0, 6: 2, 10: 4, 14: 5, 16: 14, 18: 38, 19: 84, 20: 168 },
				minzoom: 10
			},
			'{bridge-,tunnel-,}street-motorway': {
				size: { 5: 0, 6: 1, 10: 3, 14: 4, 16: 12, 18: 36, 19: 80, 20: 160 },
				opacity: { 7: 0, 9: 1 }
			},

			// trunk sizes
			'{bridge-,tunnel-,}street-trunk:outline': {
				size: { 7: 0, 8: 2, 10: 4, 14: 6, 16: 12, 18: 36, 19: 74, 20: 144 }
			},
			'{bridge-,tunnel-,}street-trunk': {
				size: { 7: 0, 8: 1, 10: 3, 14: 5, 16: 10, 18: 34, 19: 70, 20: 140 },
				opacity: { 7: 0, 8: 1 }
			},

			// primary sizes
			'{bridge-,tunnel-,}street-primary:outline': {
				size: { 8: 0, 9: 1, 10: 4, 14: 6, 16: 12, 18: 36, 19: 74, 20: 144 }
			},
			'{bridge-,tunnel-,}street-primary': {
				size: { 8: 0, 9: 2, 10: 3, 14: 5, 16: 10, 18: 34, 19: 70, 20: 140 },
				opacity: { 8: 0, 9: 1 }
			},

			// secondary sizes
			'{bridge-,tunnel-,}street-secondary:outline': {
				size: { 11: 2, 14: 5, 16: 8, 18: 30, 19: 68, 20: 138 },
				opacity: { 11: 0, 12: 1 }
			},
			'{bridge-,tunnel-,}street-secondary': {
				size: { 11: 1, 14: 4, 16: 6, 18: 28, 19: 64, 20: 130 },
				opacity: { 11: 0, 12: 1 }
			},

			// minor streets
			'{bridge-,tunnel-,}street-{tertiary,tertiary-link,unclassified,residential,livingstreet,pedestrian}*:outline':
				{
					size: { 12: 2, 14: 3, 16: 6, 18: 26, 19: 64, 20: 128 },
					opacity: { 12: 0, 13: 1 }
				},
			'{bridge-,tunnel-,}street-{tertiary,tertiary-link,unclassified,residential,livingstreet,pedestrian}*':
				{
					size: { 12: 1, 14: 2, 16: 5, 18: 24, 19: 60, 20: 120 },
					opacity: { 12: 0, 13: 1 }
				},

			// service streets
			'{bridge-,tunnel-,}street-service:outline': {
				size: { 14: 1, 16: 3, 18: 12, 19: 32, 20: 48 },
				opacity: { 15: 0, 16: 1 },
				color: colors.streetbg.lighten(0.3)
			},
			'{bridge-,tunnel-,}street-service': {
				size: { 14: 1, 16: 2, 18: 10, 19: 28, 20: 40 },
				opacity: { 15: 0, 16: 1 },
				color: colors.street.darken(0.03)
			},

			// ways (footpaths, cycleways)
			'{bridge-,tunnel-,}way-*:outline': {
				size: { 15: 0, 16: 5, 18: 7, 19: 12, 20: 22 },
				minzoom: 15
			},
			'{bridge-,tunnel-,}way-*': {
				size: { 15: 0, 16: 4, 18: 6, 19: 10, 20: 20 },
				minzoom: 15
			},

			// footways
			'{bridge-,}way-{footway,path,steps}:outline': {
				color: colors.foot.darken(0.1)
			},
			'{bridge-,}way-{footway,path,steps}': {
				color: colors.foot.lighten(0.02)
			},

			// cycleways
			'{bridge-,}way-cycleway:outline': {
				color: colors.cycle.darken(0.1)
			},
			'{bridge-,}way-cycleway': {
				color: colors.cycle
			},

			// rail
			'{tunnel-,bridge-,}transport-{rail,lightrail}:outline': {
				color: colors.rail,
				minzoom: 8,
				size: { 8: 1, 13: 1, 15: 1, 20: 14 }
			},
			'{tunnel-,bridge-,}transport-{rail,lightrail}': {
				color: colors.rail,
				minzoom: 14,
				size: { 14: 0, 15: 1, 20: 10 },
				lineDasharray: [2, 2]
			},

			// subway
			'{tunnel-,bridge-,}transport-subway:outline': {
				color: colors.subway,
				size: { 11: 0, 12: 1, 15: 3, 16: 3, 18: 6, 19: 8, 20: 10 }
			},
			'{tunnel-,bridge-,}transport-subway': {
				color: colors.subway,
				size: { 11: 0, 12: 1, 15: 2, 16: 2, 18: 5, 19: 6, 20: 8 },
				lineDasharray: [2, 2]
			},

			// labels
			'label-boundary-*': {
				color: colors.label.lighten(0.1),
				font: fonts.bold,
				textTransform: 'uppercase',
				textHaloColor: colors.labelHalo,
				textHaloWidth: 0.5,
				textHaloBlur: 3,
				textAnchor: 'top',
				textOffset: [0, 0.2],
				textPadding: 0,
				textOptional: true
			},
			'label-boundary-country-large': {
				minzoom: 2,
				size: { 2: 8, 5: 13 }
			},
			'label-boundary-country-medium': {
				minzoom: 3,
				size: { 3: 8, 5: 12 }
			},
			'label-boundary-country-small': {
				minzoom: 4,
				size: { 4: 8, 5: 11 }
			},
			'label-boundary-state': {
				minzoom: 7,
				maxzoom: 9,
				size: { 7: 8, 8: 12 }
			},

			'label-place-*': {
				opacity: 0,
				color: colors.label,
				font: fonts.regular,
				textHaloColor: colors.labelHalo,
				textHaloWidth: 0.5,
				textHaloBlur: 3
			},

			'label-place-suburb': {
				minzoom: 11,
				size: { 11: 11, 14: 14 },
				opacity: 1
			},

			'label-place-capital': {
				minzoom: 7,
				size: { 7: 12, 10: 16 },
				opacity: 1
			},
			'label-place-statecapital': {
				minzoom: 7,
				size: { 7: 11, 10: 15 },
				opacity: 1
			},
			'label-place-city': {
				minzoom: 7,
				size: { 7: 11, 10: 14 },
				opacity: 1
			},
			'label-place-town': {
				minzoom: 9,
				size: { 9: 11, 12: 14 },
				opacity: 1
			},
			'label-place-village': {
				minzoom: 11,
				size: { 11: 11, 14: 14 },
				opacity: 1
			},
			'label-place-hamlet': {
				font: fonts.regular,
				minzoom: 11,
				size: { 11: 11, 14: 14 },
				opacity: 1
			},
			'label-street-*': {
				color: colors.label,
				font: fonts.regular,
				textHaloColor: colors.labelHalo,
				textHaloWidth: 0.5,
				textHaloBlur: 3,
				symbolPlacement: 'line',
				textAnchor: 'center',
				minzoom: 13,
				size: { 13: 10, 15: 13 }
			}
		};
	}
}

export function getMapStyle(
	styleOptions: StyleBuilderOptions & {
		theme?: MapDesignTokens;
		transitionDuration?: number;
		disableDarkMode?: boolean;
	} = {}
): StyleSpecification {
	const { theme, ...builderOptions } = styleOptions;
	const teikeiStyle = new TeikeiStyleBuilder(theme);

	const style = teikeiStyle.build({
		baseUrl: 'https://tiles.versatiles.org', // TODO: Set-up a CDN instead of using versatiles directly?
		language: 'de', // TODO: make this dynamic, based on embed locale
		...builderOptions
	});

	if (styleOptions.transitionDuration != null) {
		style.transition = { duration: styleOptions.transitionDuration, delay: 0 };
	}

	return style as StyleSpecification;
}

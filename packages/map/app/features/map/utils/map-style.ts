import { type StyleBuilderOptions, styles } from '@versatiles/style'
import { StyleBuilder } from '@versatiles/style/src/style_builder/style_builder.js'
import type {
  StyleBuilderColors,
  StyleRules,
  StyleRulesOptions
} from '@versatiles/style/src/style_builder/types.js'
import chroma from 'chroma-js'
import type { StyleSpecification } from 'react-map-gl/maplibre'

// Create a color scale with 10 shades based on #266050
const baseColor = '#266050'

// Create a scale from light to dark
const colorScale = chroma
  .scale([
    chroma(baseColor).brighten(3).desaturate(0.5), // Lightest
    baseColor, // Base color
    chroma(baseColor).darken(3).desaturate(0.5) // Darkest
  ])
  .mode('lab')
  .colors(11)

// Color scale mapping for easy reference
const green = {
  50: colorScale[0], // Lightest shade
  100: colorScale[1],
  200: colorScale[2],
  300: colorScale[3],
  400: colorScale[4],
  500: colorScale[5], // Base color
  600: colorScale[6],
  700: colorScale[7],
  800: colorScale[8],
  900: colorScale[9],
  950: colorScale[10] // Darkest shade
}

/**
 * Custom Teikei StyleBuilder class based on colorful.ts
 */
class TeikeiStyleBuilder extends StyleBuilder {
  public readonly name: string = 'Teikei'

  public defaultFonts = {
    regular: 'noto_sans_regular',
    bold: 'noto_sans_bold'
  }

  public defaultColors: StyleBuilderColors = {
    /** Color for land areas on the map. */
    land: green[400],

    /** Color for water bodies like lakes and rivers. */
    water: green[500],

    /** Color for glacier areas, usually shown as white. */
    glacier: green[400],

    /** Color for wooded or forested areas. */
    wood: green[400],

    /** Color for grasslands or open fields. */
    grass: green[400],

    /** Color for parks and recreational areas. */
    park: green[400],

    /** Color used for parking areas. */
    parking: green[300] + '77',

    /** Color used for footpaths and pedestrian areas. */
    foot: green[300] + '77',

    /** Color used for cycle paths. */
    cycle: green[300] + '77',

    /** Color for streets and roads on the map. */
    street: green[300],

    /** Color for major highways or motorways. */
    motorway: green[300],

    /** Color for trunk roads. */
    trunk: green[300],

    /** Background color for streets. */
    streetbg: green[500] + '55',

    /** Background color for motorways. */
    motorwaybg: green[500] + '55',

    /** Background color for trunk roads. */
    trunkbg: green[500] + '55',

    /** Background color for buildings. */
    buildingbg: green[500] + '55',

    /** Primary color for buildings. */
    building: green[200] + '33',

    /** Color used for boundaries. */
    boundary: green[300],

    /** Color used for disputed boundaries. */
    disputed: green[300],

    /** Color used for residential areas. */
    residential: green[300] + '55',

    /** Color used for commercial areas. */
    commercial: green[300] + '55',

    /** Color used for industrial areas. */
    industrial: green[300] + '55',

    /** Color used for shields on maps. */
    shield: green[800] + 'CC',

    /** Primary color used for labels. */
    label: green[800],

    /** Color used for label halos. */
    labelHalo: green[300] + 'EE',

    /** Color used for agriculture areas. */
    agriculture: green[400],

    /** Color used for railways. */
    rail: green[300] + '77',

    /** Color used for subways and underground systems. */
    subway: green[300] + '77',

    /** Color used for waste areas. */
    waste: green[400],

    /** Color used for burial and cemetery areas. */
    burial: green[400],

    /** Color used for sand areas like beaches. */
    sand: green[400],

    /** Color used for rocky terrain. */
    rock: green[400],

    /** Color used for leisure areas like parks and gardens. */
    leisure: green[400],

    /** Color used for wetland areas like marshes. */
    wetland: green[400],

    /** Color used for various symbols on the map. */
    symbol: green[800],

    /** Color indicating danger or warning areas. */
    danger: green[200] + '77',

    /** Color used for points of interest. */
    poi: green[800],

    /** Color used for construction sites. */
    construction: green[400],

    /** Color used for educational facilities. */
    education: green[300] + '55',

    /** Color used for hospitals and medical facilities. */
    hospital: green[200] + '77',

    /** Color used for prison areas. */
    prison: green[400]
  }

  protected getStyleRules(options: StyleRulesOptions): StyleRules {
    const { colors, fonts } = options
    return {
      // background
      background: {
        color: colors.land
      },

      // boundary
      'boundary-{country,state}:outline': {
        color: colors.land.lighten(0.1),
        lineBlur: 1,
        lineCap: 'round',
        lineJoin: 'round'
      },
      'boundary-{country,state}': {
        color: colors.boundary,
        lineCap: 'round',
        lineJoin: 'round'
      },
      'boundary-country{-disputed,}:outline': {
        size: { 2: 0, 3: 2, 10: 8 },
        opacity: 0.75,
        color: colors.land.lighten(0.05)
      },
      'boundary-country{-disputed,}': {
        size: { 2: 0, 3: 1, 10: 4 }
      },
      'boundary-country-disputed': {
        color: colors.disputed,
        lineDasharray: [2, 1],
        lineCap: 'square'
      },
      'boundary-state:outline': {
        size: { 7: 0, 8: 2, 10: 4 },
        opacity: 0.75
      },
      'boundary-state': {
        size: { 7: 0, 8: 1, 10: 2 }
      },

      // water
      'water-*': {
        color: colors.water,
        lineCap: 'round',
        lineJoin: 'round'
      },
      'water-area': {
        opacity: { 4: 0, 6: 1 }
      },
      'water-area-*': {
        opacity: { 4: 0, 6: 1 }
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
      //   'building:outline': {
      //     color: colors.buildingbg,
      //     opacity: { 14: 0, 15: 1 },
      //   },
      //   'building': {
      //     color: colors.building,
      //     opacity: { 14: 0, 15: 1 },
      //     fillTranslate: [-2, -2],
      //   },

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
        size: { 5: 0, 6: 2, 10: 5, 14: 5, 16: 14, 18: 38, 19: 84, 20: 168 }
      },
      '{bridge-,tunnel-,}street-motorway': {
        size: { 5: 0, 6: 1, 10: 4, 14: 4, 16: 12, 18: 36, 19: 80, 20: 160 },
        opacity: { 5: 0, 6: 1 }
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
        color: colors.rail.lighten(0.25),
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
        color: colors.subway.lighten(0.25),
        size: { 11: 0, 12: 1, 15: 2, 16: 2, 18: 5, 19: 6, 20: 8 },
        lineDasharray: [2, 2]
      },

      // labels
      'label-boundary-*': {
        color: colors.label,
        font: fonts.regular,
        textTransform: 'uppercase',
        textHaloColor: colors.labelHalo,
        textHaloWidth: 2,
        textHaloBlur: 1,
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
        minzoom: 5,
        color: colors.label.lighten(0.05),
        size: { 5: 8, 8: 12 }
      },
      'label-place-*': {
        // Hide all place labels by setting opacity to 0
        opacity: 0,
        color: '#00ffff',
        font: fonts.regular,
        textHaloColor: colors.labelHalo,
        textHaloWidth: 2,
        textHaloBlur: 1
      },

      'label-place-suburb': {
        font: fonts.regular,
        minzoom: 5, // Only show from zoom level 5 and higher
        color: '#ff00ff',
        size: { 5: 12, 7: 16 } // Adjusted size breakpoints to match minzoom
        // Removed opacity: 0 - now labels will show at zoom 5+
      },

      'label-place-capital': {
        font: fonts.regular,
        minzoom: 5,
        size: { 5: 12, 10: 16 },
        opacity: 0 // Hide capital labels
      },
      'label-place-statecapital': {
        font: fonts.regular,
        minzoom: 6,
        size: { 6: 11, 10: 15 },
        opacity: 0 // Hide state capital labels
      },
      'label-place-city': {
        font: fonts.regular,

        minzoom: 7,
        color: '#FFff00',
        size: { 7: 11, 10: 14 },
        opacity: 0 // Hide city labels
      },
      'label-place-town': {
        font: fonts.regular,

        minzoom: 9,
        color: '#0000ff',
        size: { 9: 11, 12: 14 },
        opacity: 0 // Hide town labels
      },
      'label-place-village': {
        font: fonts.regular,
        minzoom: 11,
        color: '#00ff00',
        size: { 9: 11, 12: 14 },
        opacity: 0 // Hide village labels
      },
      'label-place-hamlet': {
        font: fonts.regular,
        minzoom: 13,
        color: '#ff0000',
        size: { 10: 11, 12: 14 }
      },
      'label-street-*': {
        color: colors.label,
        font: fonts.regular,
        textHaloColor: colors.labelHalo,
        textHaloWidth: 2,
        textHaloBlur: 1,
        symbolPlacement: 'line',
        textAnchor: 'center',
        minzoom: 12,
        size: { 12: 10, 15: 13 }
      },

      // symbols and POIs
      'symbol-*': {
        iconSize: 1,
        symbolPlacement: 'point',
        iconOpacity: 0.7,
        iconKeepUpright: true,
        font: fonts.regular,
        size: 10,
        color: colors.symbol,
        iconAnchor: 'bottom',
        textAnchor: 'top',
        textHaloColor: colors.labelHalo,
        textHaloWidth: 2,
        textHaloBlur: 1
      },
      'poi-*': {
        minzoom: 16,
        iconSize: { 16: 0.5, 19: 0.5, 20: 1 },
        opacity: { 16: 0, 17: 0.4 },
        symbolPlacement: 'point',
        iconOptional: true,
        font: fonts.regular,
        color: colors.poi
      }
    }
  }
}

export function getMapStyle(
  styleOptions: StyleBuilderOptions & {
    transitionDuration?: number
    disableDarkMode?: boolean
  } = {}
): StyleSpecification {
  const teikeiStyle = new TeikeiStyleBuilder()

  const style = teikeiStyle.build({
    baseUrl: 'https://tiles.versatiles.org', // TODO: Set-up a CDN instead of using versatiles directly?
    language: 'de', // TODO: make this dynamic, based on embed locale
    ...styleOptions
  })

  if (styleOptions.transitionDuration != null) {
    style.transition = { duration: styleOptions.transitionDuration, delay: 0 }
  }

  return style as StyleSpecification
}

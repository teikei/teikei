import { styles, type StyleBuilderOptions } from '@versatiles/style'
import { StyleSpecification } from 'react-map-gl/maplibre'

import chroma from 'chroma-js'

// Create a color scale with 10 shades based on #266050
const baseColor = '#266050'

// Create a scale from light to dark
const colorScale = chroma.scale([
  chroma(baseColor).brighten(3).desaturate(0.5),    // Lightest
  baseColor,                                          // Base color
  chroma(baseColor).darken(3).desaturate(0.5)       // Darkest
]).mode('lab').colors(11)

// Color scale mapping for easy reference
const green = {
  50: colorScale[0],  // Lightest shade
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

console.log('Color Scale:', colorScale)

export function getMapStyle(
  styleOptions: StyleBuilderOptions & {
    transitionDuration?: number
    disableDarkMode?: boolean
  } = {}
): StyleSpecification {
  const style = styles.graybeard({
    baseUrl: 'https://tiles.versatiles.org', // TODO: Set-up a CDN instead of using versatiles directly?
    language: 'de', // TODO: make this dynamic, based on embed locale
    colors: {
      /** Color for land areas on the map. */
      land: green[400],

      /** Color for water bodies like lakes and rivers. */
      water: green[500],

      /** Color for glacier areas, usually shown as white. */
      glacier: green[400],

      // /** Color for wooded or forested areas. */
      wood: green[400],

      // /** Color for grasslands or open fields. */
      grass: green[400],

      // /** Color for parks and recreational areas. */
      park: green[400],

      // /** Color used for parking areas. */
      parking: green[300] + '77',

      // /** Color used for footpaths and pedestrian areas. */
      foot: green[300] + '77',

      // /** Color used for cycle paths. */
      cycle: green[300] + '77',

      /** Color for streets and roads on the map. */
      street: green[300],

      // /** Color for major highways or motorways. */
      motorway: green[300],

      /** Color for trunk roads. */
      trunk: green[300],

      // /** Background color for streets. */
      streetbg: green[500] + '55',

      // /** Background color for motorways. */
      motorwaybg: green[500] + '55',

      /** Background color for trunk roads. */
      trunkbg: green[500] + '55',

      // /** Background color for buildings. */
      buildingbg: green[500] + '55',

      // /** Primary color for buildings. */
      building: green[200] + '33',

      // /** Color used for boundaries. */
      boundary: green[300],

      // /** Color used for disputed boundaries. */
      disputed: green[300],

      // /** Color used for residential areas. */
      residential: green[300] + '55',

      // /** Color used for commercial areas. */
      commercial: green[300] + '55',

      // /** Color used for industrial areas. */
      industrial: green[300] + '55',

      // /** Color used for shields on maps. */
      shield: green[800] + 'CC',

      // /** Primary color used for labels. */
      label: green[800],

      // /** Color used for label halos. */
      labelHalo: green[300] + 'EE',

      // /** Color used for agriculture areas. */
      agriculture: green[400],

      // /** Color used for railways. */
      rail: green[300] + '77',

      // /** Color used for subways and underground systems. */
      subway: green[300] + '77',

      // /** Color used for waste areas. */
      waste: green[400],

      // /** Color used for burial and cemetery areas. */
      burial: green[400],

      // /** Color used for sand areas like beaches. */
      sand: green[400],

      // /** Color used for rocky terrain. */
      rock: green[400],

      // /** Color used for leisure areas like parks and gardens. */
      leisure: green[400],

      // /** Color used for wetland areas like marshes. */
      wetland: green[400],

      // /** Color used for various symbols on the map. */
      symbol: green[800],

      // /** Color indicating danger or warning areas. */
      danger: green[200] + '77',

      // /** Color used for points of interest. */
      poi: green[800]
    },
    ...styleOptions
  })

  if (styleOptions.transitionDuration != null) {
    style.transition = { duration: styleOptions.transitionDuration, delay: 0 }
  }

  return style as StyleSpecification
}

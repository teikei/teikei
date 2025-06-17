import { styles, type StyleBuilderOptions } from '@versatiles/style';

export function getMapStyle(
	styleOptions: StyleBuilderOptions & {
		transitionDuration?: number;
		disableDarkMode?: boolean;
	} = {}
) {
	const style = styles.graybeard({
        baseUrl: 'https://tiles.versatiles.org', // TODO: Set-up a CDN instead of using versatiles directly?
        language: "de", // TODO: make this dynamic, based on embed locale
        colors: {
            /** Color for land areas on the map. */
            land: '#397666',

            /** Color for water bodies like lakes and rivers. */
            water: '#397666',

            /** Color for glacier areas, usually shown as white. */
            glacier: '#397666',

            // /** Color for wooded or forested areas. */
            wood: '#397666',

            // /** Color for grasslands or open fields. */
            grass: '#397666',

            // /** Color for parks and recreational areas. */
            park: '#397666',

            // /** Color used for parking areas. */
            parking: '#568E7F',

            /** Color for trunk roads. */
            trunk: '#568E7F',

            // /** Color used for footpaths and pedestrian areas. */
            foot: '#568E7F',

            // /** Color used for cycle paths. */
            cycle: '#568E7F',

            /** Color for streets and roads on the map. */
            street: '#568E7F',

            // /** Color for major highways or motorways. */
            motorway: '#568E7F',
            
            // /** Background color for streets. */
            streetbg: '#53857677',

            // /** Background color for motorways. */
            motorwaybg: '#53857677',

            /** Background color for trunk roads. */
            trunkbg: '#53857677',

            // /** Background color for buildings. */
            buildingbg: '#53857677',

            // /** Primary color for buildings. */
            building: '#619B8A33',

            // /** Color used for boundaries. */
            boundary: '#294F4E',

            // /** Color used for disputed boundaries. */
            disputed: '#294F4E',

            // /** Color used for residential areas. */
            residential: '#619B8A55',

            // /** Color used for commercial areas. */
            commercial: '#619B8A55',

            // /** Color used for industrial areas. */
            industrial: '#619B8A55',

            // /** Color used for shields on maps. */
            shield: '#051F1FCC',

            // /** Primary color used for labels. */
            label: '#051F1F',

            // /** Color used for label halos. */
            labelHalo: '#619B8AEE',

            // /** Color used for agriculture areas. */
            agriculture: '#397666',

            // /** Color used for railways. */
            rail: '#53857677',

            // /** Color used for subways and underground systems. */
            subway: '#53857699',

            // /** Color used for waste areas. */
            waste: '#397666',

            // /** Color used for burial and cemetery areas. */
            burial: '#397666',

            // /** Color used for sand areas like beaches. */
            sand: '#397666',

            // /** Color used for rocky terrain. */
            rock: '#397666',

            // /** Color used for leisure areas like parks and gardens. */
            leisure: '#397666',

            // /** Color used for wetland areas like marshes. */
            wetland: '#397666',

            // /** Color used for various symbols on the map. */
            symbol: '#051F1F',

            // /** Color indicating danger or warning areas. */
            danger: '#568E7F',

            // /** Color used for points of interest. */
            poi: '#051F1F',
        },
        ...styleOptions
      });

      if (styleOptions.transitionDuration != null) {
		style.transition = { duration: styleOptions.transitionDuration, delay: 0 };
	}

    console.log('style', style);

	return style;
}
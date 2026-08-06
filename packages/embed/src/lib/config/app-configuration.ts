import { readEmbedConfig, type EmbedConfig } from './embed-config';
import { defaultDesignThemeId, getDesignThemeId } from '$lib/design/themes';

const defaultConfig = {
	country: 'DE',
	countries: {
		DE: {
			center: [51.1657, 10.4515],
			zoom: 6
		},
		CH: {
			center: [46.8182, 8.2275],
			zoom: 8
		},
		AT: {
			center: [47.6965, 13.3457],
			zoom: 7
		}
	},
	padding: [0, 170],
	zoom: {
		default: 8,
		min: 6,
		max: 15,
		searchResult: 14
	},
	baseUrl: '/#',
	apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3030',
	assetsBaseUrl: '/assets',
	externalHelpUrl: '',
	siteUrl: 'https://ernte-teilen.org/',
	privacyUrl: 'https://ernte-teilen.org/datenschutz/',
	imprintUrl: 'https://ernte-teilen.org/impressum/',
	mapboxAboutUrl: 'https://maplibre.org/',
	openStreetMapAboutUrl: 'https://www.openstreetmap.org/about/',
	mapFeedbackUrl: 'https://www.mapbox.com/map-feedback/',
	theme: defaultDesignThemeId,
	displayLocale: 'de-DE',
	userCommunicationLocale: 'de-DE',
	farmId: ''
};

type Configuration = typeof defaultConfig;

function applyCountryOverrides(config: Configuration): Configuration {
	if (config.country === 'CH-de') {
		return {
			...config,
			country: 'CH',
			countries: {
				...config.countries,
				CH: {
					center: [46.8182, 8.2275],
					zoom: 8
				}
			}
		};
	}

	if (config.country === 'CH-fr') {
		return {
			...config,
			country: 'CH',
			countries: {
				...config.countries,
				CH: {
					center: [46.6921, 6.7086],
					zoom: 9
				}
			}
		};
	}

	return config;
}

function createConfiguration(): Configuration {
	if (typeof window === 'undefined') {
		return defaultConfig;
	}

	const embedConfig: EmbedConfig = readEmbedConfig();

	const merged: Configuration = {
		...defaultConfig,
		country: embedConfig.country ?? defaultConfig.country,
		displayLocale: embedConfig.displayLocale ?? defaultConfig.displayLocale,
		userCommunicationLocale:
			embedConfig.userCommunicationLocale ?? defaultConfig.userCommunicationLocale,
		apiBaseUrl: embedConfig.apiBaseUrl ?? defaultConfig.apiBaseUrl,
		baseUrl: embedConfig.baseUrl ?? defaultConfig.baseUrl,
		externalHelpUrl: embedConfig.externalHelpUrl ?? defaultConfig.externalHelpUrl,
		farmId: embedConfig.farmId ?? defaultConfig.farmId,
		assetsBaseUrl: embedConfig.assetsBaseUrl ?? defaultConfig.assetsBaseUrl,
		siteUrl: embedConfig.siteUrl ?? defaultConfig.siteUrl,
		privacyUrl: embedConfig.privacyUrl ?? defaultConfig.privacyUrl,
		imprintUrl: embedConfig.imprintUrl ?? defaultConfig.imprintUrl,
		mapboxAboutUrl: embedConfig.mapboxAboutUrl ?? defaultConfig.mapboxAboutUrl,
		openStreetMapAboutUrl: embedConfig.openStreetMapAboutUrl ?? defaultConfig.openStreetMapAboutUrl,
		mapFeedbackUrl: embedConfig.mapFeedbackUrl ?? defaultConfig.mapFeedbackUrl,
		theme: getDesignThemeId(embedConfig.theme)
	};

	return applyCountryOverrides(merged);
}

const config = Object.freeze(createConfiguration()) as Configuration;

export default config;

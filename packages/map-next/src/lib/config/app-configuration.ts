import { getEmbedConfig, type EmbedConfig } from './embed-config';

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
	displayLocale: 'de-DE',
	userCommunicationLocale: 'de-DE',
	farmId: ''
};

type Configuration = typeof defaultConfig;

/**
 * Applies country-specific overrides for regional variants.
 * Handles CH-de (German-speaking Switzerland) and CH-fr (French-speaking Switzerland).
 */
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

/**
 * Merges default configuration with embed configuration.
 * Embed config values take precedence when present (not null).
 */
function createConfiguration(): Configuration {
	// In SSR context, use defaults
	if (typeof window === 'undefined') {
		return defaultConfig;
	}

	const embedConfig = getEmbedConfig();

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
		assetsBaseUrl: embedConfig.assetsBaseUrl ?? defaultConfig.assetsBaseUrl
	};

	// Apply country-specific overrides (CH-de, CH-fr)
	return applyCountryOverrides(merged);
}

// Create configuration on module load
const config = Object.freeze(createConfiguration()) as Configuration;

export default config;

// Re-export for access to embed-specific utilities
export { getEmbedConfig, isEmbedded } from './embed-config';
export type { EmbedConfig };

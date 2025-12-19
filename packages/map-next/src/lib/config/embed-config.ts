/**
 * Embed Configuration Module
 *
 * Reads configuration from the data attributes of the  #teikei-app container.
 * This enables the SvelteKit app to be configured when embedded in external pages.
 */

export interface EmbedConfig {
	baseUrl: string | null;
	country: string | null;
	displayLocale: string | null;
	userCommunicationLocale: string | null;
	apiBaseUrl: string | null;
	externalHelpUrl: string | null;
	farmId: string | null;
	assetsBaseUrl: string | null;
}

const CONTAINER_ID = 'teikei-app';

export function readEmbedConfig(): EmbedConfig {
	const config = {
		baseUrl: null,
		country: null,
		displayLocale: null,
		userCommunicationLocale: null,
		apiBaseUrl: null,
		externalHelpUrl: null,
		farmId: null,
		assetsBaseUrl: null
	};

	if (typeof document === 'undefined') {
		return config;
	}
	const container = document.getElementById(CONTAINER_ID) ?? null;

	if (!container) {
		return config;
	}

	return Object.assign({}, config, container.dataset);
}

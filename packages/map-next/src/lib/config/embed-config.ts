/**
 * Embed Configuration Module
 *
 * Reads configuration from the data attributes of the #teikei-app container.
 * This enables the SvelteKit app to be configured when embedded in external pages.
 *
 * When running inside a shadow DOM, the host element (#teikei-app) still exists
 * in the main document and its data attributes can be read directly.
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

/**
 * Find the host element containing our app.
 * When running in shadow DOM, we need to traverse up from any shadow root
 * to find the actual host element with data attributes.
 */
function findHostElement(): HTMLElement | null {
	const appMount = document.getElementById('teikei-app-shadow-root');
	if (appMount) {
		const shadowRoot = appMount.getRootNode();
		if (shadowRoot instanceof ShadowRoot) {
			const host = shadowRoot.host;
			if (host instanceof HTMLElement && host.id === CONTAINER_ID) {
				return host;
			}
		}
	}

	return null;
}

export function readEmbedConfig(): EmbedConfig {
	const config: EmbedConfig = {
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

	const container = findHostElement();

	if (!container) {
		return config;
	}

	return Object.assign({}, config, container.dataset);
}

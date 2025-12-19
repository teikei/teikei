/**
 * Embed Configuration Module
 *
 * Reads configuration from the data attributes of the container elements.
 * This enables the SvelteKit app to be configured when embedded in external pages.
 *
 * Supported containers (merged in order, later takes precedence):
 * - #teikei-app: Main app container
 * - #teikei-search: Search widget container
 * - #teikei-network: Network widget container
 *
 * Supported data attributes:
 * - data-base-url: The base URL path for routing (e.g., "/karte#")
 * - data-country: Country code (DE, CH, CH-de, CH-fr, AT)
 * - data-display-locale: Locale for display formatting (e.g., "de-DE")
 * - data-user-communication-locale: Locale for user communication
 * - data-api-base-url: API server base URL
 * - data-external-help-url: URL for external help documentation
 * - data-farm-id: Specific farm ID to display
 * - data-assets-base-url: Base URL for static assets
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

// Container IDs to check, in order of precedence (later overrides earlier)
const CONTAINER_IDS = ['teikei-app', 'teikei-search', 'teikei-network'] as const;

/**
 * Gets all container elements that exist in the DOM.
 */
export function getContainerElements(): HTMLElement[] {
	if (typeof document === 'undefined') {
		return [];
	}
	return CONTAINER_IDS.map((id) => document.getElementById(id)).filter(
		(el): el is HTMLElement => el !== null
	);
}

/**
 * Gets the primary container element (first one found).
 */
export function getContainerElement(): HTMLElement | null {
	const containers = getContainerElements();
	return containers.length > 0 ? containers[0] : null;
}

/**
 * Reads configuration from the embed container's data attributes.
 * Merges data from all containers, with later containers taking precedence.
 * Returns null values for any attributes not present.
 */
export function readEmbedConfig(): EmbedConfig {
	if (typeof document === 'undefined') {
		// SSR/prerender context - return null config
		return {
			baseUrl: null,
			country: null,
			displayLocale: null,
			userCommunicationLocale: null,
			apiBaseUrl: null,
			externalHelpUrl: null,
			farmId: null,
			assetsBaseUrl: null
		};
	}

	const containers = getContainerElements();
	if (containers.length === 0) {
		console.warn(`[Teikei] No embed container found (looked for: ${CONTAINER_IDS.join(', ')})`);
		return {
			baseUrl: null,
			country: null,
			displayLocale: null,
			userCommunicationLocale: null,
			apiBaseUrl: null,
			externalHelpUrl: null,
			farmId: null,
			assetsBaseUrl: null
		};
	}

	// Merge data from all containers
	const mergedData: Record<string, string> = {};
	for (const container of containers) {
		Object.assign(mergedData, container.dataset);
	}

	return {
		baseUrl: mergedData.baseUrl ?? null,
		country: mergedData.country ?? null,
		displayLocale: mergedData.displayLocale ?? null,
		userCommunicationLocale: mergedData.userCommunicationLocale ?? null,
		apiBaseUrl: mergedData.apiBaseUrl ?? null,
		externalHelpUrl: mergedData.externalHelpUrl ?? null,
		farmId: mergedData.farmId ?? null,
		assetsBaseUrl: mergedData.assetsBaseUrl ?? null
	};
}

/**
 * Cached embed configuration.
 * Initialized on first access in the browser.
 */
let cachedConfig: EmbedConfig | null = null;

/**
 * Gets the embed configuration, caching it after first read.
 */
export function getEmbedConfig(): EmbedConfig {
	if (cachedConfig === null) {
		cachedConfig = readEmbedConfig();
	}
	return cachedConfig;
}

/**
 * Checks if the app is running in embedded mode.
 * Returns true if the #teikei-app container was found with any data attributes.
 */
export function isEmbedded(): boolean {
	const config = getEmbedConfig();
	return Object.values(config).some((value) => value !== null);
}

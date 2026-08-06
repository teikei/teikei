/**
 * Portal utilities for Shadow DOM support
 *
 * When the app is embedded via teikei-loader.js, it runs inside a Shadow DOM
 * for style isolation. Portals (dropdowns, selects, modals, etc.) need to
 * render inside the shadow root to maintain style isolation.
 *
 * The loader exposes `globalThis.__teikei_portal_container` when running in
 * shadow DOM mode. This utility provides access to that container.
 */

declare global {
	var __teikei_portal_container: HTMLElement | undefined;
}

/**
 * Returns the portal container element for use with bits-ui Portal components.
 *
 * When running inside Shadow DOM (embedded mode), returns the portal container
 * inside the shadow root. Otherwise returns undefined, letting bits-ui use its
 * default behavior (document.body).
 */
export function getPortalContainer(): HTMLElement | undefined {
	if (typeof globalThis !== 'undefined' && globalThis.__teikei_portal_container) {
		return globalThis.__teikei_portal_container;
	}
	return undefined;
}

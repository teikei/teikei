/**
 * Teikei Loader
 *
 * DOM loader for the Teikei app. Mounts the application inside a Shadow DOM
 * for complete style isolation from host page styles.
 */

function getCurrentScript() {
	// Note: for `type="module"` scripts, `document.currentScript` can be `null`
	// (especially in dev servers / some browsers). Fall back to finding the
	// currently executing loader script via `import.meta.url`.
	const current = /** @type {HTMLScriptElement | null} */ (document.currentScript);
	if (current) return current;

	try {
		const selfUrl = new URL(import.meta.url);
		const scripts = /** @type {NodeListOf<HTMLScriptElement>} */ (
			document.querySelectorAll('script[type="module"][src]')
		);

		for (let i = scripts.length - 1; i >= 0; i--) {
			const script = scripts[i];
			if (!script.src) continue;
			const scriptUrl = new URL(script.src);
			if (scriptUrl.href === selfUrl.href || scriptUrl.pathname === selfUrl.pathname) {
				return script;
			}
		}
	} catch {
		// Ignore and fall through.
	}

	return null;
}

function ensureHost(script) {
	const hostSelector = script?.getAttribute('data-host');
	if (!hostSelector) {
		throw new Error('teikei-loader: missing required data-host attribute');
	}
	const host = document.querySelector(hostSelector);
	if (!host) {
		throw new Error(
			`teikei-loader: data-host selector '${hostSelector}' did not match any element`
		);
	}
	return host;
}

/**
 * Creates a Shadow DOM inside the host element for style isolation.
 * Returns the shadow root.
 */
function createShadowRoot(host) {
	// Check if shadow root already exists
	if (host.shadowRoot) {
		return host.shadowRoot;
	}

	const shadowRoot = host.attachShadow({ mode: 'open' });
	return shadowRoot;
}

function resolveTheme(script, host) {
	const theme = script?.getAttribute('data-theme') || host.getAttribute('data-theme');
	if (theme) {
		host.setAttribute('data-theme', theme);
	}
	return theme;
}

/**
 * Injects styles into the shadow root
 */
function insertStylesIntoShadow(shadowRoot, cssHref) {
	if (!cssHref) return;

	// Check if already inserted
	const existingLink = shadowRoot.querySelector(`link[data-teikei-css="true"][href="${cssHref}"]`);
	if (existingLink) return;

	const link = document.createElement('link');
	link.setAttribute('data-teikei-css', 'true');
	link.rel = 'stylesheet';
	link.href = cssHref;
	shadowRoot.appendChild(link);
}

/**
 * Creates the mount element and portal container inside the shadow root
 */
function ensureMountInShadow(shadowRoot, mountId, theme) {
	const id = mountId || 'teikei-mount';

	// Create wrapper that holds both mount and portal container
	let wrapper = shadowRoot.querySelector('.teikei-shadow-wrapper');
	if (!wrapper) {
		wrapper = document.createElement('div');
		wrapper.className = 'teikei-shadow-wrapper';
		wrapper.style.cssText =
			'display: block; width: 100%; height: 100%; min-height: 100%; position: relative;';
		shadowRoot.appendChild(wrapper);
	}
	if (theme) {
		wrapper.setAttribute('data-theme', theme);
	}

	// Create mount element for the Svelte app
	let mount = wrapper.querySelector(`#${id}`);
	if (!mount) {
		mount = document.createElement('div');
		mount.id = id;
		mount.style.cssText = 'display: block; width: 100%; height: 100%; min-height: 100%;';
		wrapper.appendChild(mount);
	}

	// Create portal container for bits-ui portals (dropdowns, selects, etc.)
	let portalContainer = wrapper.querySelector('#teikei-portal-container');
	if (!portalContainer) {
		portalContainer = document.createElement('div');
		portalContainer.id = 'teikei-portal-container';
		// Portal container needs to be positioned for absolute positioning of portal content.
		// It is click-through (pointer-events: none) so the full-width strip never blocks the
		// map; each portaled surface re-enables pointer events below so items, scrollbars,
		// overlays, and close buttons stay interactive in embedded mode.
		portalContainer.style.cssText =
			'position: absolute; top: 0; left: 0; width: 100%; pointer-events: none;';
		wrapper.appendChild(portalContainer);

		const portalPointerStyle = document.createElement('style');
		portalPointerStyle.textContent = '#teikei-portal-container > * { pointer-events: auto; }';
		wrapper.appendChild(portalPointerStyle);
	}

	// Expose portal container globally for bits-ui portals to use
	globalThis.__teikei_portal_container = portalContainer;
	globalThis.__teikei_shadow_root = shadowRoot;

	return mount;
}

function maybeInitSvelteKitGlobal(script, jsHref) {
	const explicitName = script.getAttribute('data-sveltekit');
	const inferredName = !explicitName && jsHref?.endsWith('main.js') ? 'teikei' : null;
	const name = explicitName || inferredName;
	if (!name) return;

	const key = `__sveltekit_${name}`;

	if (globalThis[key]) return;

	globalThis[key] = {
		base: new URL('.', location).pathname.slice(0, -1)
	};
}

async function run() {
	const script = getCurrentScript();
	if (!script) return;

	const jsHref = script.getAttribute('data-js');
	if (!jsHref) {
		throw new Error('teikei-loader: missing required data-js attribute');
	}

	// Resolve CSS href - defaults to main.css alongside main.js if not specified
	let cssHref = script.getAttribute('data-css');
	if (!cssHref && jsHref) {
		// Auto-resolve CSS path from JS path
		cssHref = jsHref.replace(/\.js$/, '.css');
	}

	const mountIdAttr = script.getAttribute('data-mount-id') || undefined;
	const mountId = mountIdAttr || (jsHref.endsWith('main.js') ? 'teikei-app-root' : undefined);

	maybeInitSvelteKitGlobal(script, jsHref);

	const host = ensureHost(script);
	const theme = resolveTheme(script, host);

	// Create Shadow DOM for style isolation
	const shadowRoot = createShadowRoot(host);

	// Inject styles into shadow root (not document head)
	insertStylesIntoShadow(shadowRoot, cssHref);

	// Create mount element inside shadow root
	const mount = ensureMountInShadow(shadowRoot, mountId, theme);

	const mod = await import(jsHref);
	const startFn = mod?.start;
	if (typeof startFn !== 'function') {
		throw new Error(`teikei-loader: module ${jsHref} must export a start(mountElement) function`);
	}

	startFn(mount);
}

run();

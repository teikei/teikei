/**
 * Teikei Loader
 *
 * Plain DOM loader for the Teikei app. Mounts the application directly
 * on the host element without using Shadow DOM.
 *
 * Usage (place this <script> inside the host container element):
 *
 *   <div id="teikei-app" data-...>
 *     <script type="module"
 *       src="/teikei-loader.js"
 *       data-js="/main.js"
 *       data-css="/main.css"></script>
 *   </div>
 *
 * Generic widget usage:
 *
 *   <div id="search-widget">
 *     <script type="module"
 *       src="/teikei-loader.js"
 *       data-js="/search-widget.js"
 *       data-css="/search-widget.css"
 *     ></script>
 *   </div>
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
	const host = script?.parentElement;
	if (!host) {
		throw new Error('teikei-loader: script must be placed inside a host element');
	}
	return /** @type {HTMLElement} */ (host);
}

function insertStyles(cssHref) {
	if (!cssHref) return;

	// Check if already inserted
	const existingLink = document.querySelector(`link[data-teikei-css="true"][href="${cssHref}"]`);
	if (existingLink) return;

	const link = document.createElement('link');
	link.setAttribute('data-teikei-css', 'true');
	link.rel = 'stylesheet';
	link.href = cssHref;
	document.head.appendChild(link);
}

function ensureMount(host, mountId) {
	const id = mountId || 'teikei-mount';
	let mount = host.querySelector(`#${id}`);
	if (!mount) {
		mount = document.createElement('div');
		mount.id = id;
		// Ensure mount element fills the host container for proper height inheritance
		mount.style.cssText = 'display: block; width: 100%; height: 100%; min-height: 100%;';
		host.appendChild(mount);
	}
	return mount;
}

function maybeInitSvelteKitGlobal(script, jsHref) {
	const explicitName = script.getAttribute('data-sveltekit');
	const inferredName = !explicitName && jsHref?.endsWith('main.js') ? 'teikei' : null;
	const name = explicitName || inferredName;
	if (!name) return;

	const key = `__sveltekit_${name}`;
	// Don't stomp an existing initializer if the host page already set it.
	if (globalThis[key]) return;

	// Match the pattern used in the original embed demo.
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

	const cssHref = script.getAttribute('data-css');
	const mountIdAttr = script.getAttribute('data-mount-id') || undefined;
	const mountId = mountIdAttr || (jsHref.endsWith('main.js') ? 'teikei-app-root' : undefined);

	maybeInitSvelteKitGlobal(script, jsHref);

	const host = ensureHost(script);
	insertStyles(cssHref);
	const mount = ensureMount(host, mountId);

	const mod = await import(jsHref);
	const startFn = mod?.start;
	if (typeof startFn !== 'function') {
		throw new Error(`teikei-loader: module ${jsHref} must export a start(mountElement) function`);
	}

	startFn(mount);
}

run();

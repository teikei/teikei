/**
 * Teikei Shadow DOM Loader
 *
 * Usage (place this <script> inside the host container element):
 *
 *   <div id="teikei-app" data-...>
 *     <script type="module"
 *       src="/teikei-shadow-loader.js"
 *       data-js="/main.js"
 *       data-css="/main.css"></script>
 *   </div>
 *
 * Generic widget usage:
 *
 *   <div id="search-widget">
 *     <script type="module"
 *       src="/teikei-shadow-loader.js"
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

function ensureShadowHost(script) {
	const host = script?.parentElement;
	if (!host) {
		throw new Error('teikei-shadow-loader: script must be placed inside a host element');
	}
	return /** @type {HTMLElement} */ (host);
}

function ensureShadowRoot(host) {
	return host.shadowRoot ?? host.attachShadow({ mode: 'open' });
}

function upsertStyles(shadow, cssHref) {
	// Baseline is intentionally minimal: avoid destructive resets.
	let baseline = shadow.querySelector('style[data-teikei-baseline="true"]');
	if (!baseline) {
		baseline = document.createElement('style');
		baseline.setAttribute('data-teikei-baseline', 'true');
		baseline.textContent = `
			:host {
				font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
					'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
				font-size: 16px;
				line-height: 1.5;
				color: var(--foreground);
				background-color: var(--background);
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
			}
			*,
			*::before,
			*::after {
				box-sizing: border-box;
			}
		`;
		shadow.appendChild(baseline);
	}

	if (cssHref) {
		let link = shadow.querySelector('link[data-teikei-css="true"]');
		if (!link) {
			link = document.createElement('link');
			link.setAttribute('data-teikei-css', 'true');
			link.rel = 'stylesheet';
			shadow.appendChild(link);
		}
		// Always set href (allows updating between dev/prod URLs)
		link.href = cssHref;
	}
}

function ensureMount(shadow, mountId) {
	const id = mountId || 'teikei-shadow-mount';
	let mount = shadow.getElementById(id);
	if (!mount) {
		mount = document.createElement('div');
		mount.id = id;
		shadow.appendChild(mount);
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
		throw new Error('teikei-shadow-loader: missing required data-js attribute');
	}

	const cssHref = script.getAttribute('data-css');
	const mountIdAttr = script.getAttribute('data-mount-id') || undefined;
	const mountId =
		mountIdAttr || (jsHref.endsWith('main.js') ? 'teikei-app-shadow-root' : undefined);

	maybeInitSvelteKitGlobal(script, jsHref);

	const host = ensureShadowHost(script);
	const shadow = ensureShadowRoot(host);

	upsertStyles(shadow, cssHref);
	const mount = ensureMount(shadow, mountId);

	const mod = await import(jsHref);
	const startFn = mod?.start;
	if (typeof startFn !== 'function') {
		throw new Error(
			`teikei-shadow-loader: module ${jsHref} must export a start(mountElement) function`
		);
	}

	startFn(mount);
}

run();

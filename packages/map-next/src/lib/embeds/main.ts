/**
 * Loader script for embedding the full SvelteKit app with hash routing.
 *
 * This loader is a stable entry point that dynamically fetches and loads
 * the SvelteKit app (which has hashed filenames). The client only needs
 * to include this loader script - it handles everything else.
 *
 * Usage:
 * <div id="teikei-app"></div>
 * <script src="https://map.ernte-teilen.org/loader.js" async></script>
 *
 * Or with custom base URL:
 * <div id="teikei-app" data-base-url="https://custom-cdn.example.com"></div>
 * <script src="https://map.ernte-teilen.org/loader.js" async></script>
 */

(function () {
	const CONTAINER_ID = 'teikei-app';

	/**
	 * Get the base URL for loading app assets.
	 * Priority: data-base-url attribute > script src directory > current page
	 */
	function getBaseUrl(): string {
		const container = document.getElementById(CONTAINER_ID);
		if (container?.dataset.baseUrl) {
			return container.dataset.baseUrl.replace(/\/$/, '');
		}

		// Try to get from script src
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length - 1; i >= 0; i--) {
			const src = scripts[i].src;
			if (src && src.includes('main.js')) {
				return src.replace(/\/main\.js.*$/, '');
			}
		}

		// Fallback to current page origin
		return window.location.origin;
	}

	/**
	 * Load CSS file
	 */
	function loadCSS(href: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = href;
			link.onload = () => resolve();
			link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
			document.head.appendChild(link);
		});
	}

	/**
	 * Parse index.html to extract required scripts and styles
	 */
	function parseIndexHtml(
		html: string,
		baseUrl: string
	): {
		scripts: string[];
		preloads: string[];
		styles: string[];
		bootstrapCode: string;
	} {
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');

		// Extract modulepreload links
		const preloads: string[] = [];
		doc.querySelectorAll('link[rel="modulepreload"]').forEach((link) => {
			const href = link.getAttribute('href');
			if (href) {
				preloads.push(baseUrl + href);
			}
		});

		// Extract stylesheet links
		const styles: string[] = [];
		doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
			const href = link.getAttribute('href');
			if (href) {
				styles.push(baseUrl + href);
			}
		});

		// Extract the bootstrap script content
		const scriptEl = doc.querySelector('body script');
		let bootstrapCode = scriptEl?.textContent || '';

		// Fix relative paths in the bootstrap code
		bootstrapCode = bootstrapCode.replace(/import\("(\/_app\/[^"]+)"\)/g, `import("${baseUrl}$1")`);

		// Extract the import URLs for preloading
		const scripts: string[] = [];
		const importMatches = bootstrapCode.matchAll(/import\("([^"]+)"\)/g);
		for (const match of importMatches) {
			scripts.push(match[1]);
		}

		return { scripts, preloads, styles, bootstrapCode };
	}

	/**
	 * Create and inject preload links for faster loading
	 */
	function injectPreloads(urls: string[]): void {
		urls.forEach((url) => {
			const link = document.createElement('link');
			link.rel = 'modulepreload';
			link.href = url;
			document.head.appendChild(link);
		});
	}

	/**
	 * Mount the SvelteKit app
	 */
	async function mountApp(container: HTMLElement, baseUrl: string): Promise<void> {
		try {
			// Fetch the index.html from the SvelteKit build
			const response = await fetch(`${baseUrl}/index.html`);
			if (!response.ok) {
				throw new Error(`Failed to fetch app: ${response.status}`);
			}
			const html = await response.text();

			// Parse the HTML to extract required resources
			const { preloads, styles, bootstrapCode } = parseIndexHtml(html, baseUrl);

			// Load CSS files
			await Promise.all(styles.map((href) => loadCSS(href)));

			// Inject preload hints
			injectPreloads(preloads);

			// Create the app container structure matching SvelteKit's expectations
			const appContainer = document.createElement('div');
			appContainer.style.display = 'contents';
			container.appendChild(appContainer);

			// Set up the global SvelteKit config
			// @ts-expect-error - SvelteKit global
			window.__sveltekit_1sxc0l2 = {
				base: '' // Hash routing doesn't need a base path
			};

			// Create and execute the bootstrap script
			const script = document.createElement('script');
			script.type = 'module';

			// Modify bootstrap to use our container
			const modifiedBootstrap = `
				const element = document.getElementById('${CONTAINER_ID}').firstElementChild;
				${bootstrapCode.replace(/const element = document\.currentScript\.parentElement;?/, '')}
			`;

			script.textContent = modifiedBootstrap;
			document.body.appendChild(script);
		} catch (error) {
			console.error('Teikei: Failed to load app', error);
			container.innerHTML = `
				<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #dc2626; font-family: system-ui, sans-serif;">
					Failed to load the Teikei map. Please try again later.
				</div>
			`;
		}
	}

	/**
	 * Initialize the loader
	 */
	function init(): void {
		const container = document.getElementById(CONTAINER_ID);
		if (!container) {
			console.warn(`Teikei: Container element #${CONTAINER_ID} not found`);
			return;
		}

		// Show loading state
		container.innerHTML = `
			<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-family: system-ui, sans-serif;">
				Loading map...
			</div>
		`;

		const baseUrl = getBaseUrl();
		mountApp(container, baseUrl);
	}

	// Handle both immediate and deferred loading
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

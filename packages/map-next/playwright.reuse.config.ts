import { defineConfig } from '@playwright/test';

/*
 * The default config builds the app inside Playwright's 60s webServer timeout,
 * which the build regularly exceeds locally — every test then fails with errors
 * that look like app bugs. This config skips the build and reuses a running
 * preview server: `npm run build`, then `npm run preview -- --port 4173`, then
 * `npx playwright test --config ./playwright.reuse.config.ts`.
 */
export default defineConfig({
	webServer: { command: 'npm run preview -- --port 4173', port: 4173, reuseExistingServer: true },
	testDir: 'e2e',
	use: { baseURL: 'http://localhost:4173' }
});

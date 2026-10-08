import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
	projects: [
		// Fast UI-behaviour tests; every API call is mocked.
		{ name: 'mocked', testIgnore: /e2e\/integration\// },
		// CRUD round-trips against the real API and a seeded database (see
		// `npm run e2e:integration` in the repository root).
		{
			name: 'integration',
			testMatch: /e2e\/integration\/.*\.test\.ts$/,
			// All tests share one database and one user.
			fullyParallel: false,
			workers: 1
		}
	],
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		// Vite gives process env precedence over the (symlinked, gitignored) .env,
		// which may point at a deployed API.
		env: { VITE_API_URL: 'http://localhost:3030' }
	}
});

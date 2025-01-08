import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
	},
	testDir: 'e2e',
	projects: [
		/* Test against desktop browsers */
		{
			name: 'chromium',
			use: devices['Desktop Chrome'],
			testIgnore: /.*mobile.test.ts/,
		},
		{
			name: 'firefox',
			use: devices['Desktop Firefox'],
			testIgnore: /.*mobile.test.ts/,
		},
		/* Test against mobile viewports. */
		{
			name: 'Mobile Chrome',
			use: devices['Pixel 5'],
			testIgnore: /.*desktop.test.ts/,
		},
	],
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	use: { trace: 'on' },
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
		{
			name: 'safari',
			use: devices['Desktop Safari'],
			testIgnore: /.*mobile.test.ts/,
		},
		/* Test against mobile viewports. */
		{
			name: 'mobile chrome',
			use: devices['Pixel 5'],
			testIgnore: /.*desktop.test.ts/,
		},
		{
			name: 'mobile safari',
			use: devices['iPhone 15 Pro'],
			testIgnore: /.*desktop.test.ts/,
		},
		{
			name: 'mobile chrome',
			use: devices['Pixel 5 landscape'],
			testIgnore: /.*desktop.test.ts/,
		},
		{
			name: 'mobile safari',
			use: devices['iPhone 15 Pro landscape'],
			testIgnore: /.*desktop.test.ts/,
		},
	],
});

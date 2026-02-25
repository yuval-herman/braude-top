import { test } from '@playwright/test';

export const gotoMainExitHelp: Parameters<typeof test.beforeEach>[1] = async ({ page }) => {
	// Don't fetch the analytics script
	await page.route('https://stats.braude.top/count.js', (route) => route.abort());
	await page.goto('/');
	// Escape the help popup
	await page.locator('#driver-popover-content').waitFor({ state: 'visible' });
	await page.locator('#driver-popover-content').press('Escape');
	await page.locator('#driver-popover-content').waitFor({ state: 'detached' });
	// Set year and semester
	await page
		.getByRole('combobox', { name: 'סמסטר' })
		.selectOption('{"year":"2025","semester":"א"}');
};

import { test } from '@playwright/test';

export const gotoMainExitHelp: Parameters<typeof test.beforeEach>[1] = async ({ page }) => {
	await page.route('https://stats.braude.top/count.js', (route) => route.abort());
	await page.goto('/');
	await page.locator('#driver-popover-content').waitFor({ state: 'visible' });
	await page.locator('#driver-popover-content').press('Escape');
	await page.locator('#driver-popover-content').waitFor({ state: 'detached' });
};

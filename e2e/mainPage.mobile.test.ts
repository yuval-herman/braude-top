import test, { expect } from '@playwright/test';

test.describe('main page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		page.locator('#driver-popover-content').press('Escape');
	});

	test('make sure course list is scrollable in mobile', async ({ page }) => {
		await page.getByRole('button', { name: 'רשימת קורסים' }).click();
		const courseList = page.locator('header ~ ul');
		const isScrollable = await courseList.evaluate((el) => el.scrollHeight > el.clientHeight);
		await expect(isScrollable).toBe(true);
	});
});

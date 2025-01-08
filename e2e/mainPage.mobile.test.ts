import test, { expect } from '@playwright/test';

const hoursList = [
	'8:30',
	'9:30',
	'10:30',
	'11:30',
	'12:20',
	'הפסקת צהריים',
	'12:50',
	'13:50',
	'14:50',
	'15:50',
	'16:50',
	'17:50',
	'18:50',
	'19:50',
	'20:50',
	'21:50',
	'22:50',
];

test.describe('main page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		page.locator('#driver-popover-content').press('Escape');
	});

	test('home page has expected elements', async ({ page }) => {
		await expect(page.locator('nav').filter({ hasText: 'ראשי' })).toBeVisible();
		const table = page.locator('table');
		await expect(table).toBeVisible();
		const tableHead = table.locator('thead');
		await expect(tableHead.locator('th')).toHaveCount(7);
		const tableBody = table.locator('tbody');
		const rows = tableBody.locator('tr');
		await expect(rows).toHaveCount(hoursList.length);
		for (let i = 0; i < hoursList.length; i++) {
			await expect(rows.nth(i).locator('th').first()).toContainText(hoursList[i]);
			await expect(rows.nth(i).locator('td')).toHaveCount(6);
		}
		await expect(page.locator('header ~ ul')).toBeHidden();
	});

	test('make sure course list is scrollable', async ({ page }) => {
		await page.getByRole('button', { name: 'רשימת קורסים' }).click();
		const courseList = page.locator('header ~ ul');
		const isScrollable = await courseList.evaluate((el) => el.scrollHeight > el.clientHeight);
		await expect(isScrollable).toBe(true);
	});
});

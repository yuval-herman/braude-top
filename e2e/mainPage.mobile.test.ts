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
		await page.route('https://stats.braude.top/count.js', (route) => route.abort());
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
		await page.getByPlaceholder('חפש כאן').click();
		await page.getByPlaceholder('חפש כאן').fill('אלגברה');
		await expect(
			page.getByText(
				'אלגברה הרצאה של ד"ר עבד אל פתאח עבד אל חלים בעברית, הקורס מלא! מיועד לתעשייה וני'
			)
		).toBeVisible();
		const courseList = page.locator('ul').filter({
			hasText: 'אלגברה הרצאה של ד"ר עבד אל פתאח עבד אל חלים בעברית, הקורס מלא! מיועד לתעשייה וני',
		});
		const isScrollable = await courseList.evaluate((el) => el.scrollHeight > el.clientHeight);
		await expect(isScrollable).toBe(true);
	});
});

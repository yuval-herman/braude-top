import { expect, test } from '@playwright/test';
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
		await expect(page.locator('header ~ ul')).toBeVisible();
	});

	test('course preview show on hover', async ({ page }) => {
		await expect(page.locator('td > .item')).toBeHidden();
		await page.locator('.instance').nth(1).hover();
		await expect(page.locator('td > .item')).toBeVisible();
	});

	test('make sure course list is scrollable', async ({ page }) => {
		const courseList = page.locator('header ~ ul');
		const isScrollable = await courseList.evaluate((el) => el.scrollHeight > el.clientHeight);
		await expect(isScrollable).toBe(true);
	});

	test('two overlapping items show side by side', async ({ page }) => {
		await page.getByText('תרגיל של מר גבינט איתי בעברית יום ב חדר 201 M 12:50-14:').click();
		await page.getByText('תרגיל של ד"ר אברוס רנטה בעברית יום ב חדר 708 L 12:50-14:').click();
		await page.mouse.move(0, 0);
		await expect(page.locator('tbody')).toMatchAriaSnapshot(
			`- cell /אבטחת מידע וקריפטולוגיה מר גבינט איתי \\d+ M אבטחת מידע וקריפטולוגיה ד"ר אברוס רנטה \\d+ L/`
		);
		await expect(page.getByText('אבטחת מידע וקריפטולוגיה מר גבינט איתי 201 M')).toHaveCSS(
			'--overlap-index',
			'0'
		);
		await expect(page.getByText('אבטחת מידע וקריפטולוגיה ד"ר אברוס רנטה 708 L')).toHaveCSS(
			'--overlap-index',
			'1'
		);
	});
});

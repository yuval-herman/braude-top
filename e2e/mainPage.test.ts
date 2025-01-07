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
		await page.keyboard.press('Escape');
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

	test('add and remove instance', async ({ page }) => {
		const courseList = page.locator('header ~ ul');
		await expect(courseList).toBeVisible();

		const firstCourse = courseList.locator('li').first();
		await expect(firstCourse).toBeVisible();
		const courseTitle = await firstCourse.locator('h3').textContent();

		await expect(courseTitle).toBeTruthy();

		const firstInstance = firstCourse.locator('header ~ div > div').first();
		await expect(firstInstance).toBeVisible();

		firstInstance.click({ timeout: 500 });

		await page.mouse.move(0, 0);
		await page.waitForTimeout(500);

		await expect(
			page.locator('td > div').getByText(courseTitle!, { exact: false }).nth(0)
		).toBeVisible();

		await page.getByRole('button', { name: 'הקורסים שלי' }).click();

		const courseHeading = page.getByRole('heading', { name: courseTitle! }).nth(1);
		await courseHeading.waitFor({ state: 'visible', timeout: 1000 });

		await page.locator('header ~ div > div').first().click();
		await expect(
			page.getByText("כדי לראות קורסים צריך לבחור אותם בלשונית 'כל הקורסים'")
		).toBeVisible();

		await expect(courseHeading).toBeHidden();
	});

	test('make sure course list is scrollable in desktop', async ({ page }) => {
		const courseList = page.locator('header ~ ul');
		const isScrollable = await courseList.evaluate((el) => el.scrollHeight > el.clientHeight);
		await expect(isScrollable).toBe(true);
	});

	test('make sure course list is scrollable in mobile', async ({ page }) => {
		page.setViewportSize({
			width: 412,
			height: 915,
		});

		await page.getByRole('button', { name: 'רשימת קורסים' }).click();

		const courseList = page.locator('header ~ ul');
		const isScrollable = await courseList.evaluate((el) => el.scrollHeight > el.clientHeight);
		await expect(isScrollable).toBe(true);
	});
});

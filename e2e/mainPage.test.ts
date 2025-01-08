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

	test('add and remove instance', async ({ page }) => {
		const courseList = page.locator('header ~ ul');
		await expect(courseList).toBeVisible();

		const firstCourse = courseList.locator('li').first();
		await expect(firstCourse).toBeVisible();
		const courseTitle = await firstCourse.locator('h3').textContent();

		await expect(courseTitle).toBeTruthy();

		const firstInstance = firstCourse.locator('.instance').first();
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
});

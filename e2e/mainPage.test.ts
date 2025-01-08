import { expect, test } from '@playwright/test';

test.describe('main page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		page.locator('#driver-popover-content').waitFor({ state: 'visible' });
		page.locator('#driver-popover-content').press('Escape');
		page.locator('#driver-popover-content').waitFor({ state: 'detached' });
	});

	test('add and remove instance', async ({ page }, { project }) => {
		if (project.use.isMobile) {
			await test.step('open sidebar', async () => {
				await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			});
		}

		const courseList = page.locator('header ~ ul');
		await expect(courseList).toBeVisible();

		const firstCourse = courseList.locator('li').first();
		await expect(firstCourse).toBeVisible();
		const courseTitle = await firstCourse.locator('h3').textContent();

		await expect(courseTitle).toBeTruthy();

		const firstInstance = firstCourse.locator('.instance').first();
		await expect(firstInstance).toBeVisible();

		firstInstance.click({ timeout: 500 });

		if (!project.use.isMobile) {
			await expect(
				page.locator('td > div').getByText(courseTitle!, { exact: false }).nth(0)
			).toBeVisible();
		}
		await page.getByRole('button', { name: 'הקורסים שלי' }).click();

		const courseHeading = page.getByRole('heading', { name: courseTitle! }).nth(1);
		await courseHeading.waitFor({ state: 'visible', timeout: 1000 });

		await page.locator('header ~ div > div').first().click();
		await expect(
			page.getByText("כדי לראות קורסים צריך לבחור אותם בלשונית 'כל הקורסים'")
		).toBeVisible();

		await expect(courseHeading).toBeHidden();
	});

	test('change theme', async ({ page }) => {
		await expect(page.getByRole('table')).toHaveCSS('background-color', 'rgb(224, 230, 235)');
		await page.getByLabel('שינוי צבעים בהיר/כהה').click();
		await expect(page.getByRole('table')).toHaveCSS('background-color', 'rgb(56, 60, 63)');
	});
});

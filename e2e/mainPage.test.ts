import { expect, Page, test } from '@playwright/test';

test.describe('main page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.locator('#driver-popover-content').waitFor({ state: 'visible' });
		await page.locator('#driver-popover-content').press('Escape');
		await page.locator('#driver-popover-content').waitFor({ state: 'detached' });
	});

	async function toggleInstance(page: Page, nth = 0) {
		const courseList = page.locator('.list-container ul');
		await expect(courseList).toBeVisible();

		const firstCourse = courseList.locator('li').first();
		await expect(firstCourse).toBeVisible();
		const courseTitle = await firstCourse.locator('h3').textContent();

		await expect(courseTitle).toBeTruthy();

		const nthInstance = firstCourse.locator('.instance').nth(nth);

		nthInstance.click();

		return { courseTitle: courseTitle! };
	}

	test('search course', async ({ page }, { project }) => {
		if (project.use.isMobile) {
			await test.step('open sidebar', async () => {
				await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			});
		}

		await page.getByPlaceholder('חפש כאן').fill('אלגברה');
		await expect(page.getByRole('heading', { name: 'אלגברה', exact: true })).toBeVisible();

		await page.getByPlaceholder('חפש כאן').fill('מבוא למדעי');
		await expect(page.getByRole('heading', { name: 'מבוא למדעי המחשב (מל"מ)' })).toBeVisible();

		await page.getByPlaceholder('חפש כאן').fill('');
		await expect(page.getByRole('heading', { name: 'מבוא למדעי המחשב (מל"מ)' })).toBeHidden();
	});

	test('move course list pages', async ({ page }, { project }) => {
		if (project.use.isMobile) {
			await test.step('open sidebar', async () => {
				await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			});
		}

		const first = await page.locator('.list-container li header h3').first().ariaSnapshot();
		let current = first;
		await expect(page.getByText("עמ' 1", { exact: true })).toBeVisible();
		await page.getByRole('button', { name: 'הבא' }).click();
		await expect(page.locator('.list-container li header h3').first()).not.toMatchAriaSnapshot(
			current
		);

		current = await page.locator('.list-container li header h3').first().ariaSnapshot();
		await expect(page.getByText("עמ' 2", { exact: true })).toBeVisible();
		await page.getByRole('button', { name: 'הבא' }).click();
		await expect(page.locator('.list-container li header h3').first()).not.toMatchAriaSnapshot(
			current
		);

		current = await page.locator('.list-container li header h3').first().ariaSnapshot();
		await expect(page.getByText("עמ' 3", { exact: true })).toBeVisible();
		await page.getByRole('button', { name: 'הקודם' }).click();
		await expect(page.locator('.list-container li header h3').first()).not.toMatchAriaSnapshot(
			current
		);

		await page.getByRole('button', { name: 'הקודם' }).click();
		await expect(page.getByText("עמ' 1", { exact: true })).toBeVisible();
		await expect(page.locator('.list-container li header h3').first()).toMatchAriaSnapshot(first);
	});

	test.describe('add and remove instances', () => {
		test.beforeEach(async ({ page }, { project }) => {
			if (project.use.isMobile) {
				await test.step('open sidebar', async () => {
					await page.getByRole('button', { name: 'רשימת קורסים' }).click();
				});
			}
		});

		test('add and remove one instance', async ({ page }, { project }) => {
			const { courseTitle } = await toggleInstance(page);

			if (!project.use.isMobile) {
				await expect(
					page.locator('td > div').getByText(courseTitle, { exact: false }).nth(0)
				).toBeVisible();
			}

			await page.getByRole('button', { name: 'הקורסים שלי' }).click();
			await page.waitForTimeout(500);

			const courseHeading = page.getByRole('heading', { name: courseTitle });
			await expect(courseHeading).toBeVisible();

			await toggleInstance(page);

			await expect(
				page.getByText("כדי לראות קורסים צריך לבחור אותם בלשונית 'כל הקורסים'")
			).toBeVisible();

			await expect(courseHeading).toBeHidden();
		});
		test('add two instances and remove one', async ({ page }, { project }) => {
			const { courseTitle } = await toggleInstance(page);
			await toggleInstance(page, 1);

			if (!project.use.isMobile) {
				await expect(
					page.locator('td > div').getByText(courseTitle, { exact: false }).nth(0)
				).toBeVisible();
			}

			await page.getByRole('button', { name: 'הקורסים שלי' }).click();
			await page.waitForTimeout(500);

			const courseHeading = page.getByRole('heading', { name: courseTitle });
			await expect(courseHeading).toBeVisible();

			await toggleInstance(page);

			await expect(
				page.getByText("כדי לראות קורסים צריך לבחור אותם בלשונית 'כל הקורסים'")
			).toBeHidden();

			await expect(page.getByRole('heading', { name: courseTitle })).toBeVisible();
		});
	});

	test('change theme', async ({ page }) => {
		await expect(page.getByRole('table')).toHaveCSS('background-color', 'rgb(224, 230, 235)');
		await page.getByLabel('שינוי צבעים בהיר/כהה').click();
		await expect(page.getByRole('table')).toHaveCSS('background-color', 'rgb(56, 60, 63)');
	});
});

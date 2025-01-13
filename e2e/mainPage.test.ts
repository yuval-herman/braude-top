import { expect, Page, test } from '@playwright/test';

test.describe('main page', () => {
	test.beforeEach(async ({ page }) => {
		await page.route('https://stats.braude.top/count.js', (route) => route.abort());
		await page.goto('/');
		await page.locator('#driver-popover-content').waitFor({ state: 'visible' });
		await page.locator('#driver-popover-content').press('Escape');
		await page.locator('#driver-popover-content').waitFor({ state: 'detached' });
	});

	async function addInstance(page: Page, nth = 0) {
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
		await expect(courseList).toBeVisible();

		const firstCourse = courseList.locator('li').first();
		await expect(firstCourse).toBeVisible();
		const courseTitle = await firstCourse.locator('h3').textContent();

		await expect(courseTitle).toBeTruthy();

		const nthInstance = firstCourse.locator('.instance').nth(nth);

		nthInstance.click();

		return { courseTitle: courseTitle! };
	}
	async function removeInstance(page: Page, nth = 0) {
		const courseList = page.locator('ul').filter({
			hasText: 'אלגברה הרצאה של ד"ר עבד אל פתאח עבד אל חלים בעברית, הקורס מלא! מיועד לתעשייה וני',
		});
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

	test.describe('add and remove instances', () => {
		test.beforeEach(async ({ page }, { project }) => {
			if (project.use.isMobile) {
				await test.step('open sidebar', async () => {
					await page.getByRole('button', { name: 'רשימת קורסים' }).click();
				});
			}
		});

		test('add and remove one instance', async ({ page }, { project }) => {
			const { courseTitle } = await addInstance(page);

			if (!project.use.isMobile) {
				await expect(
					page.locator('td > div').getByText(courseTitle, { exact: false }).nth(0)
				).toBeVisible();
			}

			await page.getByRole('button', { name: 'הקורסים שלי' }).click();
			await page.waitForTimeout(500);

			const courseHeading = page.getByRole('heading', { name: courseTitle });
			await expect(courseHeading).toBeVisible();

			await removeInstance(page);

			await expect(
				page.getByText("כדי לראות קורסים צריך לבחור אותם בלשונית 'כל הקורסים'")
			).toBeVisible();

			await expect(courseHeading).toBeHidden();
		});
		test('add two instances and remove one', async ({ page }, { project }) => {
			const { courseTitle } = await addInstance(page);
			await addInstance(page, 1);

			if (!project.use.isMobile) {
				await expect(
					page.locator('td > div').getByText(courseTitle, { exact: false }).nth(0)
				).toBeVisible();
			}

			await page.getByRole('button', { name: 'הקורסים שלי' }).click();
			await page.waitForTimeout(500);

			const courseHeading = page.getByRole('heading', { name: courseTitle });
			await expect(courseHeading).toBeVisible();

			await removeInstance(page);

			await expect(
				page.getByText("כדי לראות קורסים צריך לבחור אותם בלשונית 'כל הקורסים'")
			).toBeHidden();

			await expect(page.getByRole('heading', { name: courseTitle })).toBeVisible();
		});
	});

	test.skip('change semester and year', async ({ page }, { project }) => {
		if (project.use.isMobile) {
			await test.step('open sidebar', async () => {
				await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			});
		}
		await expect(page.getByRole('main')).toMatchAriaSnapshot(`
			- heading "אבטחת מידע וקריפטולוגיה" [level=3]
			- link "מידע נוסף":
			  - img
			- text: /הרצאה של פרופ' וולקוביץ ולדימיר \\(זאב\\) בעברית יום ב חדר \\d+ L \\d+:\\d+-\\d+:\\d+ הרצאה של ד"ר אברוס רנטה בעברית יום ד חדר \\d+ M \\d+:\\d+-\\d+:\\d+ תרגיל של מר גבינט איתי בעברית יום ב חדר \\d+ M \\d+:\\d+-\\d+:\\d+ תרגיל של מר גבינט איתי בעברית יום ד חדר \\d+ M \\d+:\\d+-\\d+:\\d+ תרגיל של ד"ר אברוס רנטה בעברית יום ב חדר \\d+ L \\d+:\\d+-\\d+:\\d+/
			`);
		await page.getByLabel('סמסטר אאבקיץ').selectOption('{"year":2024,"semester":"קיץ"}');

		await page.waitForURL('/?year=2024&semester=%D7%A7%D7%99%D7%A5');
		await expect(page.getByRole('main')).toMatchAriaSnapshot(`
			- heading "אנגלית מתקדמים ב'" [level=3]
			- link "מידע נוסף":
			  - img
			- text: /שו"ת של ד"ר בדריאן נדב באנגלית, הקורס מלא! יום ב חדר \\d+ EF מע' \\d+:\\d+-\\d+:\\d+ יום ג חדר \\d+ EF מע' \\d+:\\d+-\\d+:\\d+ שו"ת של ד"ר בדריאן נדב באנגלית מיועד להנדסה אזרחית ומכונות יום א חדר \\d+ EF מע' \\d+:\\d+-\\d+:\\d+ יום ג חדר \\d+ EF מע' \\d+:\\d+-\\d+:\\d+ שו"ת של ד"ר בדריאן נדב באנגלית יום ג חדר \\d+ EF מע' \\d+:\\d+-\\d+:\\d+ יום ד חדר \\d+ EF מע' \\d+:\\d+-\\d+:\\d+ שו"ת של ד"ר אורלווה נטליה בעברית יום ג חדר \\d+ EF מע' \\d+:\\d+-\\d+:\\d+ יום ד חדר \\d+ EF מע' \\d+:\\d+-\\d+:\\d+/
			`);
	});

	test('change theme', async ({ page }) => {
		await expect(page.getByRole('table')).toHaveCSS('background-color', 'rgb(224, 230, 235)');
		await page.getByLabel('שינוי צבעים בהיר/כהה').click();
		await expect(page.getByRole('table')).toHaveCSS('background-color', 'rgb(56, 60, 63)');
	});
});

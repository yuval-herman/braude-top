import { expect, test } from '@playwright/test';
import { gotoMainExitHelp } from './test.utils';

test.describe('main page', () => {
	test.beforeEach(gotoMainExitHelp);

	test('switch semesters', async ({ page }) => {
		let baseUrl = page.url();
		await page.getByLabel('סמסטר אבאבקיץ').selectOption('{"year":2024,"semester":"א"}');
		await expect(page).toHaveURL(baseUrl + '?year=2024&semester=א');

		await page.getByLabel('סמסטר אבאבקיץ').selectOption('{"year":2024,"semester":"קיץ"}');
		await expect(page).toHaveURL(baseUrl + '?year=2024&semester=קיץ');

		await page.getByLabel('סמסטר אבאבקיץ').selectOption('{"year":2025,"semester":"א"}');
		await expect(page).toHaveURL(baseUrl + '?year=2025&semester=א');
	});

	test('searching courses', async ({ page }) => {
		await page.getByRole('button', { name: 'רשימת קורסים' }).click();
		await page.getByPlaceholder('חפש כאן').fill('חדו');
		await expect(page.getByRole('heading', { name: 'חדו"א 1', exact: true })).toBeVisible();
		await page.getByPlaceholder('חפש כאן').fill('אלגברה');
		await expect(page.getByRole('heading', { name: 'אלגברה', exact: true })).toBeVisible();
		await page.getByPlaceholder('חפש כאן').fill('מבוא למדעי המח');
		await expect(page.getByRole('heading', { name: 'מבוא למדעי המחשב (מל"מ)' })).toBeVisible();
		await page.getByPlaceholder('חפש כאן').fill('חדו"א');
		await expect(page.getByRole('heading', { name: 'חדו"א 1', exact: true })).toBeVisible();
	});

	test('switch between "my" and "all" lists', async ({ page }) => {
		await page.goto('/?query=%D7%97%D7%93%D7%95');
		await page.getByRole('button', { name: 'רשימת קורסים' }).click();

		await test.step('check "my" list is empty', async () => {
			await page.getByRole('button', { name: 'הקורסים שלי' }).click();
			await expect(
				page.getByText("כדי לראות קורסים צריך לבחור אותם בלשונית 'כל הקורסים'")
			).toBeVisible();
		});

		await test.step('select course from "all" list', async () => {
			await page.getByRole('button', { name: 'כל הקורסים' }).click();
			await expect(page.getByRole('heading', { name: 'חדו"א 1', exact: true })).toBeVisible();
			await page.getByRole('button', { name: 'הוסף קורס לרשימה' }).first().click();
			await expect(page.getByRole('button', { name: 'מחק קורס מהרשימה' })).toBeVisible();
		});

		await test.step('check course is added to "my" list', async () => {
			await page.getByRole('button', { name: 'הקורסים שלי' }).click();
			await page.waitForTimeout(250); // wait for animations
			await expect(page.getByText('נ"ז 0שעות לימוד')).toBeVisible();
			await expect(page.getByRole('heading', { name: 'חדו"א 1', exact: true })).toBeVisible();
			await page.getByRole('button', { name: 'מחק קורס מהרשימה' }).click();
		});

		await test.step('check course is removed from "my" list and still visible in "all"', async () => {
			await expect(
				page.getByText("כדי לראות קורסים צריך לבחור אותם בלשונית 'כל הקורסים'")
			).toBeVisible();
			await page.getByRole('button', { name: 'כל הקורסים' }).click();
			await page.waitForTimeout(250); // wait for animations
			await expect(page.getByRole('heading', { name: 'חדו"א 1', exact: true })).toBeVisible();
		});
	});

	test('adding selecting multiple courses', async ({ page }) => {
		await page.getByRole('button', { name: 'רשימת קורסים' }).click();

		await test.step('add course חדו"א 1מ', async () => {
			await page.getByPlaceholder('חפש כאן').fill('חדו"א 1מ');
			await page.getByRole('button', { name: 'הוסף קורס לרשימה' }).click();
		});

		await test.step('add course אלגברה 1מח', async () => {
			await page.getByPlaceholder('חפש כאן').fill('אלגברה 1מח');
			await page.getByRole('button', { name: 'הוסף קורס לרשימה' }).click();
		});

		await test.step('add course מיומנויות יסוד', async () => {
			await page.getByPlaceholder('חפש כאן').fill('מיומנויות יסוד');
			await page.getByRole('button', { name: 'הוסף קורס לרשימה' }).click();
		});

		await test.step('check courses were added to "my" list', async () => {
			await page.getByRole('button', { name: 'הקורסים שלי' }).click();
			await page.waitForTimeout(250); // wait for animations
			await expect(page.getByRole('heading', { name: 'חדו"א 1מ' })).toBeVisible();
			await expect(page.getByRole('heading', { name: 'אלגברה 1מח' })).toBeVisible();
			await expect(page.getByRole('heading', { name: 'מיומנויות יסוד הנדסיות' })).toBeVisible();
		});

		await test.step('select instances from all courses', async () => {
			await page.getByText('הרצאה של ד"ר יעקובזון פיאנה בעברית, הקורס מלא!').click();

			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await expect(page.getByText('הרצאה חדו"א 1מ ד"ר יעקובזון פיאנה 708 L')).toBeVisible();
			await expect(page.getByText('הרצאה חדו"א 1מ ד"ר יעקובזון פיאנה 102 EM')).toBeVisible();
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();

			await page
				.getByText(
					'הרצאה של ד"ר פוגרבניאק ילנה בעברית, הקורס מלא! מיועד לחשמל, אלקטרוניקה, תוכנה ומ'
				)
				.click();
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await expect(page.getByText('הרצאה חדו"א 1מ ד"ר פוגרבניאק ילנה 709 L')).toBeVisible();
			await expect(page.getByText('הרצאה חדו"א 1מ ד"ר פוגרבניאק ילנה 203 EM')).toBeVisible();

			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await expect(page.getByRole('main')).toContainText(
				'מועד ראשון, בחינה, בתאריך 2025-2-6 08:30מועד שני, בחינה רגילה, בתאריך 2025-3-3 08:30מועד ראשון, בחינה, בתאריך 2025-2-6 08:30מועד שני, בחינה רגילה, בתאריך 2025-3-3 08:30'
			);

			await page
				.getByText('הרצאה של ד"ר שנבל אופיר בעברית, הקורס מלא! יום ה חדר 203 EM 08:30-11:')
				.click();
			await page
				.getByText('תרגיל של ד"ר נסאר ספות בעברית, הקורס מלא! יום ה חדר 210 M 13:50-15:')
				.click();
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();

			await expect(page.getByText('הרצאה אלגברה 1')).toBeVisible();
			await expect(page.getByText('תרגיל אלגברה 1')).toBeVisible();
			await expect(page.getByText("4 3 ש'")).toBeVisible();
			await expect(page.getByRole('main')).toContainText(
				'מועד ראשון, בחינה, בתאריך 2025-2-11 08:30מועד שני, בחינה רגילה, בתאריך 2025-3-6 08:30'
			);
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await page
				.getByText('שו"ת של ד"ר פייגר חנה בעברית, הקורס מלא! יום א חדר 101 EM 14:50-16:')
				.click();

			await page.getByText('שו"ת של ד"ר פישר שחור דנה בעברית יום ב חדר 303 M 16:50-18:').click();
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();

			await expect(
				page.getByText('שו"ת מיומנויות יסוד הנדסיות ד"ר פייגר חנה 101 EM')
			).toBeVisible();
			await expect(
				page.getByText('שו"ת מיומנויות יסוד הנדסיות ד"ר פישר שחור דנה 303 M')
			).toBeVisible();
			await expect(page.getByText("1 2 ש'")).toBeVisible();
		});
	});

	test('selecting instances directly from "all" list', async ({ page }) => {
		await page.goto('/?query=%D7%97%D7%93%D7%95');
		await page.getByRole('button', { name: 'רשימת קורסים' }).click();

		await expect(page.getByRole('heading', { name: 'חדו"א 1', exact: true })).toBeVisible();

		await test.step('ascertain no course was selected', async () => {
			await page.getByRole('button', { name: 'הקורסים שלי' }).click();
			await expect(
				page.getByText("כדי לראות קורסים צריך לבחור אותם בלשונית 'כל הקורסים'")
			).toBeVisible();
			await page.getByRole('button', { name: 'כל הקורסים' }).click();
		});

		await test.step('add instances', async () => {
			await page
				.getByText("הרצאה של פרופ' ילין מרק בעברית מיועד למכונות יום ג חדר 303 EM 08:30-10:30")
				.click();
			await expect(page.getByRole('button', { name: 'מחק קורס מהרשימה' })).toBeVisible();
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();

			await expect(page.getByText('הרצאה חדו"א 1 פרופ\' ילין מרק 303 EM')).toBeVisible();
			await expect(page.getByText('הרצאה חדו"א 1 פרופ\' ילין מרק 202 EM')).toBeVisible();
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();

			await page
				.getByText("הרצאה של פרופ' ילין מרק בעברית מיועד לביוטכנולוגיה יום ב חדר 706 L 13:50-15:50")
				.click();
			await page
				.getByText('הרצאה של ד"ר שוורצמן לודמילה בעברית, הקורס מלא! מיועד להנדסה אזרחית יום ב חדר')
				.click();
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();

			await expect(page.getByText('הרצאה חדו"א 1 ד"ר שוורצמן לודמילה 103 EM')).toBeVisible();
			await expect(page.getByText('הרצאה חדו"א 1 פרופ\' ילין מרק 706 L')).toBeVisible();
			await expect(page.getByText('הרצאה חדו"א 1 ד"ר שוורצמן לודמילה 709 L')).toBeVisible();
			await expect(
				page.getByText('הרצאה חדו"א 1 פרופ\' ילין מרק 202 EM', { exact: true }).nth(1)
			).toBeVisible();
		});
	});
	test('removing instances', async ({ page }) => {
		await page.goto(
			'/?query=%D7%9E%D7%91%D7%95%D7%90+%D7%9C%D7%9E%D7%93%D7%A2%D7%99+%D7%94%D7%9E%D7%97%D7%A9%D7%91'
		);
		await page.getByRole('button', { name: 'רשימת קורסים' }).click();

		await test.step('add instances', async () => {
			await page.getByText('הרצאה של ד"ר מילר אורנה בעברית יום ג חדר 709 L 08:30-10:').click();
			await page
				.getByText('הרצאה של ד"ר מילר אורנה בעברית יום ב חדר 221 M נגישות 08:30-10:')
				.click();

			await page.getByText("הרצאה של גב' ארז יעל ב יום ה חדר 103 EM 12:50-14:").click();
			await page.getByText("מעבדה של גב' רונן ענבל ב יום ה חדר מע' 109 M 16:50-18:").click();
		});

		await test.step('check instances were added', async () => {
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await expect(
				page.getByText('הרצאה מבוא למדעי המחשב (מל"מ) ד"ר מילר אורנה 221 M נגישות')
			).toBeVisible();
			await expect(
				page.getByText('הרצאה מבוא למדעי המחשב (מל"מ) ד"ר מילר אורנה 709 L')
			).toBeVisible();

			await expect(
				page.getByText("מעבדה מבוא למדעי המחשב ושפת C גב' רונן ענבל מע' 109 M")
			).toBeVisible();
			await expect(page.getByText('הרצאה מבוא למדעי המחשב ושפת C')).toBeVisible();
		});

		await test.step('remove instances', async () => {
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await page.getByText('הרצאה של ד"ר מילר אורנה בעברית יום ג חדר 709 L 08:30-10:').click();
			await page
				.getByText('הרצאה של ד"ר מילר אורנה בעברית יום ב חדר 221 M נגישות 08:30-10:')
				.click();

			await page.getByText("הרצאה של גב' ארז יעל ב יום ה חדר 103 EM 12:50-14:").click();
			await page.getByText("מעבדה של גב' רונן ענבל ב יום ה חדר מע' 109 M 16:50-18:").click();
		});

		await test.step('check instances were removed', async () => {
			await page.getByRole('button', { name: 'הקורסים שלי' }).click();
			await expect(page.getByRole('main')).toContainText('נ"ז 0שעות לימוד 0');

			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await expect(
				page.getByText('הרצאה מבוא למדעי המחשב (מל"מ) ד"ר מילר אורנה 221 M נגישות')
			).not.toBeVisible();
			await expect(
				page.getByText('הרצאה מבוא למדעי המחשב (מל"מ) ד"ר מילר אורנה 709 L')
			).not.toBeVisible();

			await expect(
				page.getByText("מעבדה מבוא למדעי המחשב ושפת C גב' רונן ענבל מע' 109 M")
			).not.toBeVisible();
			await expect(page.getByText('הרצאה מבוא למדעי המחשב ושפת C')).not.toBeVisible();
		});
	});

	test('removing all instances', async ({ page }) => {
		await page.goto(
			'/?query=%D7%9E%D7%91%D7%95%D7%90+%D7%9C%D7%9E%D7%93%D7%A2%D7%99+%D7%94%D7%9E%D7%97%D7%A9%D7%91'
		);

		await test.step('add instances', async () => {
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await page
				.getByText("מעבדה של מר כהן גדעון בעברית, הקורס מלא! יום ב חדר 306 M מע' 15:50-17:")
				.click();
			await page.getByText("הרצאה של גב' ארז יעל ב יום ה חדר 103 EM 12:50-14:").click();
			await page
				.getByText("מעבדה של מר ליחולט אנטולי בעברית יום ד חדר מע' 109 M 16:50-18:")
				.click();
			await page
				.getByText("מעבדה של מר שדה אייל בעברית, הקורס מלא! יום ד חדר 316 M מע' 10:30-12:")
				.click();
		});

		await test.step('check instances were added', async () => {
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await expect(
				page.getByText('מעבדה מבוא למדעי המחשב (מל"מ) מר כהן גדעון 306 M מע\'')
			).toBeVisible();
			await expect(page.getByText('הרצאה מבוא למדעי המחשב ושפת C')).toBeVisible();
			await expect(
				page.getByText("מעבדה מבוא למדעי המחשב ושפת C מר שדה אייל 316 M מע'")
			).toBeVisible();
			await expect(
				page.getByText("מעבדה מבוא למדעי המחשב ושפת C מר ליחולט אנטולי מע' 109 M")
			).toBeVisible();
		});

		await test.step('remove all instances', async () => {
			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await page.getByRole('button', { name: 'הקורסים שלי' }).click();
			await expect(page.getByRole('main')).toContainText('נ"ז 8שעות לימוד 8');
			page.once('dialog', (dialog) => dialog.accept().catch(() => {}));
			await page.getByRole('button', { name: 'מחק הכל' }).click();
		});

		await test.step('verify instances were removed', async () => {
			await expect(
				page.getByText("כדי לראות קורסים צריך לבחור אותם בלשונית 'כל הקורסים'")
			).toBeVisible();

			await page.getByRole('button', { name: 'רשימת קורסים' }).click();
			await expect(
				page.getByText('מעבדה מבוא למדעי המחשב (מל"מ) מר כהן גדעון 306 M מע\'')
			).not.toBeVisible();
			await expect(page.getByText('הרצאה מבוא למדעי המחשב ושפת C')).not.toBeVisible();
			await expect(
				page.getByText("מעבדה מבוא למדעי המחשב ושפת C מר שדה אייל 316 M מע'")
			).not.toBeVisible();
			await expect(
				page.getByText("מעבדה מבוא למדעי המחשב ושפת C מר ליחולט אנטולי מע' 109 M")
			).not.toBeVisible();
		});
	});

	test('data survives refresh (in localstorage)', async ({ page }) => {
		await page.goto(
			'/?query=%D7%9E%D7%91%D7%95%D7%90+%D7%9C%D7%9E%D7%93%D7%A2%D7%99+%D7%94%D7%9E%D7%97%D7%A9%D7%91'
		);

		await page.getByRole('button', { name: 'רשימת קורסים' }).click();
		await test.step('add instances', async () => {
			await page
				.getByText("מעבדה של מר כהן גדעון בעברית, הקורס מלא! יום ב חדר 306 M מע' 15:50-17:")
				.click();
			await page.getByText("הרצאה של גב' ארז יעל ב יום ה חדר 103 EM 12:50-14:").click();
			await page
				.getByText("מעבדה של מר ליחולט אנטולי בעברית יום ד חדר מע' 109 M 16:50-18:")
				.click();
			await page
				.getByText("מעבדה של מר שדה אייל בעברית, הקורס מלא! יום ד חדר 316 M מע' 10:30-12:")
				.click();
		});

		await page.reload();

		await test.step('verify instances still exist', async () => {
			await expect(
				page.getByText('מעבדה מבוא למדעי המחשב (מל"מ) מר כהן גדעון 306 M מע\'')
			).toBeVisible();
			await expect(
				page.getByRole('gridcell', { name: 'הרצאה מבוא למדעי המחשב ושפת C' })
			).toBeVisible();
			await expect(
				page.getByText("מעבדה מבוא למדעי המחשב ושפת C מר שדה אייל 316 M מע'")
			).toBeVisible();
			await expect(
				page.getByText("מעבדה מבוא למדעי המחשב ושפת C מר ליחולט אנטולי מע' 109 M")
			).toBeVisible();
		});
	});
});

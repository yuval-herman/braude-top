import type { Page } from '@sveltejs/kit';
import { driver, type Config, type DriveStep } from 'driver.js';

const baseDriverConfig: Config = {
	showProgress: true,
	nextBtnText: 'הבא',
	prevBtnText: 'הקודם',
	doneBtnText: 'סיום',
	progressText: '{{current}} מתוך {{total}}'
};

function mainPage() {
	const driverObj = driver({
		...baseDriverConfig,
		steps: [
			{
				popover: {
					title: 'ברוכים הבאים לbraude.top!',
					description:
						'עשיתי מאמצים רבים כדי שהאתר יהיה אינטואיטיבי ופשוט לשימוש, אבל אם אתם מסתבכים, בניתי מערכת עזרה אינטראקטיבית שתעזור לכם להישאר על הגל.'
				}
			},
			{
				element: '#help-button',
				popover: {
					title: 'כפתור הטיפים הפלאי!',
					description: 'אם אתם לא בטוחים מה לעשות לחצו כאן בכל שלב, תכנון נעים!',
					side: 'bottom'
				}
			}
		]
	});

	driverObj.drive();
}

function contactPage() {
	const driverObj = driver({
		...baseDriverConfig,
		steps: [
			{
				popover: {
					title: 'יצירת קשר',
					description: 'מכאן ניתן לשלוח לי (המפתח) הודעות לגבי באגים או בקשות ספציפיות.'
				}
			},
			{
				element: 'form',
				popover: {
					title: 'מילוי פרטים',
					description:
						'את הפרטים יש למלא כאן, את השם והמייל שלך ניתן למלא אם אתם רוצים שאחזור אליכם לגבי ההודעה במייל.',
					side: 'top'
				}
			}
		]
	});

	driverObj.drive();
}
function coursePage() {
	const driverObj = driver({
		...baseDriverConfig,
		steps: [
			{
				popover: {
					title: 'מידע על הקורס',
					description: 'בדף הזה ניתן לראות כל מיני פריטי מידע על הקורס כגון:'
				}
			},
			{
				element: '#points',
				popover: {
					description: 'נקודות זכות'
				}
			},
			{
				element: '#description',
				popover: {
					description: 'תיאור הקורס ועוד...'
				}
			},
			{
				element: '#syllabus',
				popover: {
					title: 'קישור לידיעון',
					description: 'בנוסף מופיעים קישורים שימושיים לידיעון, כגון סילבוס הקורס'
				}
			},
			{
				element: '#yedion',
				popover: {
					title: 'קישור לידיעון',
					description: 'או קישור לאתר הידיעון עצמו'
				}
			},
			{
				element: '#notes',
				popover: {
					title: 'הערות',
					description:
						"לבסוף וכנראה הכי חשוב, מופיעות ההערות שמפרסמת המכללה לכל קורס. כאן יהיה רשום למי מותר להירשם לקורס (תכנה, מכונות, חשמל וכו') מומלץ לוודא שנרשמת רק לקורסים מותרים כאן או ישירות באתר הידיעון."
				}
			}
		]
	});

	driverObj.drive();
}

const pageFunctions = new Map([
	['/', mainPage],
	['/contact', contactPage],
	['/course/[course_id]', coursePage]
]);

export function showHelp(page: Page) {
	if (!page.route.id) return;
	const helpFunc = pageFunctions.get(page.route.id);
	if (!helpFunc) {
		throw new Error(`no help function defined for page ${page.url} -- ${page.route.id}`);
	}
	helpFunc();
}

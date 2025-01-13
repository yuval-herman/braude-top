import type { Page } from '@sveltejs/kit';
import { driver, type Config, type DriveStep } from 'driver.js';
import { TypedLocalStorage } from './storage';

const baseDriverConfig: Config = {
	showProgress: true,
	nextBtnText: 'הבא',
	prevBtnText: 'הקודם',
	doneBtnText: 'סיום',
	progressText: '{{current}} מתוך {{total}}',
};

function mainPage() {
	const onboarded = TypedLocalStorage.getItem('onboarded');
	if (!onboarded) {
		const driverObj = driver({
			...baseDriverConfig,
			steps: [
				{
					popover: {
						title: 'ברוכים הבאים לbraude.top!',
						description:
							'עשיתי מאמצים רבים כדי שהאתר יהיה אינטואיטיבי ופשוט לשימוש, אבל אם אתם מסתבכים, בניתי מערכת עזרה אינטראקטיבית שתעזור לכם להישאר על הגל🌊.',
					},
				},
				{
					element: '#help-button',
					popover: {
						title: 'כפתור הטיפים הפלאי!',
						description: 'אם אתם לא בטוחים מה לעשות לחצו כאן בכל שלב, תכנון נעים!',
						side: 'bottom',
					},
				},
			],
		});
		driverObj.drive();
	} else {
		const hiddenListMode = !document.querySelector('.list-container')?.checkVisibility();
		const showListBtn = document.querySelector(
			'th > [aria-label="רשימת קורסים"]'
		) as HTMLButtonElement;
		const showMyCourseBtn = document.getElementById('my-courses') as HTMLButtonElement;
		const courseQueryInput = document.getElementById('course-query') as HTMLInputElement;

		let steps: DriveStep[] = [
			{
				popover: {
					title: 'דף ראשי',
					description: 'זהו הדף הראשי של האתר, פה תבלו את רוב זמנכם בתכנון המערכת.',
					onPopoverRender: () => {
						(document.querySelector('#all-courses') as HTMLButtonElement).click();
					},
				},
			},
			{
				element: 'label:has(#year-semester)',
				popover: {
					title: 'בחירת סמסטר',
					description: 'כאן ניתן לבחור את הסמסטר שאתם מעוניינים לעבוד איתו.',
					onNextClick: () => {
						if (!hiddenListMode) {
							courseQueryInput.value = 'נתונים';
							courseQueryInput.dispatchEvent(new Event('input', { bubbles: true }));
						}
						driverObj.moveNext();
					},
				},
			},
		];

		if (hiddenListMode) {
			steps.push({
				element: showListBtn,
				popover: {
					title: 'רשימת קורסים',
					description: 'כדי לראות את רשימת הקורסים, ניתן ללחוץ על הכפתור הזה.',
					onNextClick: () => {
						showListBtn.click();
						courseQueryInput.value = 'נתונים';
						courseQueryInput.dispatchEvent(new Event('input', { bubbles: true }));
						driverObj.moveNext();
					},
				},
			});
		}
		steps = steps.concat([
			{
				element: '.list-container',
				popover: {
					title: 'רשימת קורסים',
					description:
						'כאן מופיעה רשימה של הקורסים בסמסטר הנבחר, כדי לראות קורסים יש לחפש אותם על פי שם בתיבת החיפוש.',
				},
			},
			{
				element: '.list-container li',
				popover: {
					title: 'תיבת קורס',
					description: "כל קורס מופיע בתוך 'תיבה' משל עצמו",
				},
			},
			{
				element: '.instance',
				popover: {
					title: 'תיבת קבוצה',
					description:
						"לכל קורס ישנן כמה 'קבוצות'.<br>\
						קבוצות כשמן כן הן, חלוקה של סטודנטים לקבוצות בתוך הקורס. לכל קבוצה יהיה מרצה משלה ושעות למידה שונות.<br>\
						הצבעים השונים לקבוצות עוזרים להבדיל בין הרצאות, תרגולים וכו'",
				},
			},
			{
				element: '.instance',
				popover: {
					title: 'תיבת קבוצה',
					description:
						'ניתן לרחף עם העכבר מעל קבוצה בקורס כדי לראות איפה היא תופיע במערכת שעות. כדי לבחור קבוצה, פשוט נלחץ עליה והיא תופיע מיידית במערכת השעות.',
					onNextClick: () => {
						(document.querySelector('.instance') as HTMLDivElement).click();
						driverObj.moveNext();
					},
				},
			},
			{
				element: '[aria-label="מידע נוסף"]',
				popover: {
					title: 'מידע נוסף',
					description: 'ניתן לראות מידע נוסף על הקורס בלחיצה כאן.',
				},
			},
			{
				element: '#my-courses',
				popover: {
					title: 'הקורסים שלי',
					description: "כדי לראות את רשימת הקורסים שכבר בחרנו ניתן ללחוץ על 'הקורסים שלי'.",
					onNextClick: () => {
						showMyCourseBtn.click();
						setTimeout(() => {
							driverObj.moveNext();
						}, 250);
					},
				},
			},
			{
				element: '.list-container',
				popover: {
					title: 'הקורסים שלי',
					description:
						'כאן תופיע רשימת הקורסים שבחרנו.<br>\
						לחלק מהקורסים יש דרישה להירשם גם לשיעורי תרגול ומעבדות.<br>\
						האתר עושה מאמץ לוודא שאכן הוספתם את כל השיעורים שהקורס דורש, אבל מומלץ בחום לוודא זאת באתר הידיעון.',
					onNextClick: () => {
						if (hiddenListMode) showListBtn.click();
						driverObj.moveNext();
					},
				},
			},
			{
				popover: {
					title: 'זה הכל!',
					description:
						'לכל דף באתר יש מדריך משל עצמו, אז אם אתם מסתבכים כפתור המדריך תמיד פה.<br>\
						בהצלחה בתכנון המערכת!',
				},
			},
		]);

		const driverObj = driver({
			...baseDriverConfig,
			steps,
		});
		driverObj.drive(0);
	}
}

function contactPage() {
	const driverObj = driver({
		...baseDriverConfig,
		steps: [
			{
				popover: {
					title: 'יצירת קשר',
					description: 'מכאן ניתן לשלוח לי (המפתח) הודעות לגבי באגים או בקשות ספציפיות.',
				},
			},
			{
				element: 'form',
				popover: {
					title: 'מילוי פרטים',
					description:
						'את הפרטים יש למלא כאן, את השם והמייל שלך ניתן למלא אם אתם רוצים שאחזור אליכם לגבי ההודעה במייל.',
					side: 'top',
				},
			},
		],
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
					description: 'בדף הזה ניתן לראות כל מיני פריטי מידע על הקורס כגון:',
				},
			},
			{
				element: '#points',
				popover: {
					description: 'נקודות זכות',
				},
			},
			{
				element: '#description',
				popover: {
					description: 'תיאור הקורס ועוד...',
				},
			},
			{
				element: '#syllabus',
				popover: {
					title: 'קישור לידיעון',
					description: 'בנוסף מופיעים קישורים שימושיים לידיעון, כגון סילבוס הקורס',
				},
			},
			{
				element: '#yedion',
				popover: {
					title: 'קישור לידיעון',
					description: 'או קישור לאתר הידיעון עצמו',
				},
			},
			{
				element: '#notes',
				popover: {
					title: 'הערות',
					description:
						"לבסוף וכנראה הכי חשוב, מופיעות ההערות שמפרסמת המכללה לכל קורס. כאן יהיה רשום למי מותר להירשם לקורס (תכנה, מכונות, חשמל וכו') מומלץ לוודא שנרשמת רק לקורסים מותרים כאן או ישירות באתר הידיעון.",
				},
			},
		],
	});

	driverObj.drive();
}

const pageFunctions = new Map<string, (page: Page) => void>([
	['/', mainPage],
	['/contact', contactPage],
	['/course/[course_id]', coursePage],
]);

export function showHelp(page: Page) {
	if (!page.route.id) return;
	const helpFunc = pageFunctions.get(page.route.id);
	if (!helpFunc) {
		throw new Error(`no help function defined for page ${page.url} -- ${page.route.id}`);
	}
	helpFunc(page);
}

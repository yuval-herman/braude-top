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
		(document.querySelector('#all-courses') as HTMLButtonElement).click();
		const hiddenListMode = !document.querySelector('.list-container')?.checkVisibility();
		const showListBtn = document.querySelector(
			'th > [aria-label="רשימת קורסים"]'
		) as HTMLButtonElement;
		const showMyCourseBtn = document.getElementById('my-courses') as HTMLButtonElement;

		let steps: DriveStep[] = [
			{
				popover: {
					title: 'דף ראשי',
					description: 'זהו הדף הראשי של האתר, פה תבלו את רוב זמנכם בתכנון המערכת.',
				},
			},
			{
				element: 'label:has(#year-semester)',
				popover: {
					title: 'בחירת סמסטר',
					description: 'כאן ניתן לבחור את הסמסטר שאתם מעוניינים לעבוד איתו.',
					onNextClick: () => {
						if (!hiddenListMode) {
							const courseQueryInput = document.getElementById('course-query') as HTMLInputElement;

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
						const courseQueryInput = document.getElementById('course-query') as HTMLInputElement;
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
						לכל קורס יהיה צבע משלו (לדוגמא, צהוב) ובנוסף פס צבע קטן בצד שיעזור לנו לזהות ברפרוף אם הקבוצה היא מסוג תרגיל, מעבדה וכו'",
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
				element: '.instance',
				popover: {
					title: 'תיבת קבוצה',
					description:
						'ניתן לרחף עם העכבר מעל קבוצה בקורס כדי לראות איפה היא תופיע במערכת שעות. כדי לבחור קבוצה, פשוט נלחץ עליה והיא תופיע מיידית במערכת השעות.',
				},
			},
			{
				element: '.add-button',
				popover: {
					title: 'בחירת קורסים',
					description:
						"כאמור, ניתן לבחור קבוצה מיידית, אבל דרך יותר נוחה היא לבחור 'קורס' שלם בלחיצה על כפתור 'הוסף לרשימה'. קורסים שנוספו לרשימה יופיע ברשימת 'הקורסים שלי'. רשימה זו נפרדת לכל סמסטר.",
					onNextClick: () => {
						(document.querySelector('.add-button') as HTMLDivElement).click();
						driverObj.moveNext();
					},
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
						'את הפרטים יש למלא כאן, את השם והמייל שלכם ניתן למלא אם אתם רוצים שאחזור אליכם לגבי ההודעה במייל.',
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
					description: 'בדף הזה ניתן לראות כל מיני פריטי מידע על הקורס.',
				},
			},
			{
				element: '#points',
				popover: {
					description: 'נקודות זכות',
				},
			},
			{
				element: '#syllabus',
				popover: {
					description: 'סילבוס הקורס',
				},
			},
			{
				element: '#description',
				popover: {
					description: "תיאור הקורס וכו'",
				},
			},
			{
				element: '#yedion',
				popover: {
					title: 'קישור לידיעון',
					description: 'בנוסף מופיע קישור לאתר הידיעון עצמו לנוחיותכם.',
				},
			},
			{
				element: '.comments',
				popover: {
					title: 'תגובות',
					description: 'כאן מופיעות תגובות של סטודנטים על הקורס. כדי להגיב על קורס חובה להתחבר!',
				},
			},
			{
				popover: {
					title: 'הערות',
					description:
						'כל המידע שמופיע כאן נאסף מאתר הידיעון עצמו ומתעדכן כל שלושה ימים. עם זאת מומלץ לוודא פרטים חיוניים באתר המכללה דרך הקישור לידיעון.',
				},
			},
		],
	});

	driverObj.drive();
}

function roomsPage() {
	const driverObj = driver({
		...baseDriverConfig,
		steps: [
			{
				popover: {
					title: 'חדרים ריקים',
					description:
						'כאן מופיע רשימה של חדרים ריקים שניתן לשבת ללמוד בהם. הרשימה מחושבת בעזרת חיסור הזמנים שבהם החדר תפוס מרשימת השעות האפשרית.\
						לפיכך יתכנו טעויות, אם אתם בונים על החדר למשהו מאוד חשוב מומלץ לשריין אותו דרך משרד המכללה.',
				},
			},
			{
				element: '#day',
				popover: {
					title: 'בחירת יום',
					description: 'כאן ניתן לבחור איזה יום מוצג ברשימה.',
				},
			},
			{
				element: 'thead > tr',
				popover: {
					title: 'מיון הרשימה',
					description:
						'ניתן למיין את רשימת החדרים על פי חדר, זמן התחלה או זמן סוף. כל אחת מהכותרות לחיצה.',
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
	['/rooms', roomsPage],
]);

export function showHelp(page: Page) {
	if (!page.route.id) return;
	const helpFunc = pageFunctions.get(page.route.id);
	if (!helpFunc) {
		throw new Error(`no help function defined for page ${page.url} -- ${page.route.id}`);
	}
	helpFunc(page);
}

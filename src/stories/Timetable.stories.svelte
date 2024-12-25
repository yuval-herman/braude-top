<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TimeTable from '$lib/components/TimeTable.svelte';

	const { Story } = defineMeta({
		title: 'TimeTable',
		component: TimeTable
	});

	const items = [
		{
			day: 0,
			start: 2, // 9:30
			end: 3, // 10:30
			value: {
				room: '101',
				instructor: 'ד"ר ישראל כהן',
				name: 'מבוא לפסיכולוגיה'
			}
		},
		{
			day: 0,
			start: 4, // 11:30
			end: 5, // 12:30
			value: {
				room: '205',
				instructor: "פרופ' מרים דוד",
				name: 'היסטוריה של מדע'
			}
		},
		{
			day: 1,
			start: 1, // 8:30
			end: 2, // 9:30
			value: {
				room: '303',
				instructor: 'ד"ר יוסי לוי',
				name: "פיזיקה א'"
			}
		},
		{
			day: 1,
			start: 3, // 10:30
			end: 4, // 11:30
			value: {
				room: '102',
				instructor: 'ד"ר רבקה שלם',
				name: 'מתודולוגיה של מחקר'
			}
		},
		{
			day: 2,
			start: 5, // 12:30
			end: 6, // 13:30
			value: {
				room: '405',
				instructor: 'ד"ר משה בן-דוד',
				name: 'סוציולוגיה של משפחה'
			}
		},
		{
			day: 3,
			start: 1, // 8:30
			end: 3, // 10:30
			value: {
				room: '112',
				instructor: 'ד"ר חנה צור',
				name: 'עקרונות המשפט'
			}
		},
		{
			day: 4,
			start: 2, // 9:30
			end: 4, // 11:30
			value: {
				room: '250',
				instructor: "פרופ' אברהם גולדמן",
				name: 'תיאוריה של ניהול'
			}
		},
		{
			day: 5,
			start: 3, // 10:30
			end: 5, // 12:30
			value: {
				room: '310',
				instructor: 'ד"ר יעל כהן',
				name: 'ניהול פרויקטים'
			}
		}
	];
</script>

<Story name="Empty" />
<Story
	name="Filled"
	args={{
		items
	}}
/>
<Story
	name="With preview"
	args={{
		items: items.slice(0, -1),
		preview: [items[items.length - 1]]
	}}
/>

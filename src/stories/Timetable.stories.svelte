<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TimeTable from '$lib/components/TimeTable.svelte';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'TimeTable',
		component: TimeTable
	});
</script>

<Story name="Empty" />
<Story
	name="Filled"
	args={{
		items: [
			{ day: 1, start: 2, end: 4, value: 'מתמטיקה' }, // Monday, 9:30–11:30
			{ day: 2, start: 3, end: 5, value: 'פיזיקה' }, // Tuesday, 10:30–12:30
			{ day: 3, start: 1, end: 2, value: 'כימיה' }, // Wednesday, 8:30–9:30
			{ day: 4, start: 5, end: 7, value: 'ספרות' }, // Thursday, 12:30–14:30
			{ day: 5, start: 6, end: 8, value: 'היסטוריה' }, // Friday, 13:30–15:30
			{ day: 7, start: 4, end: 6, value: 'אנגלית' } // Sunday, 11:30–13:30
		]
	}}
/>

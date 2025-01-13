<script module>
	import TimeTable from '$lib/components/TimeTable.svelte';
	import { itemizeCourseList } from '$lib/utils';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import allCourses from '../fullcourses.json';

	const { Story } = defineMeta({
		title: 'TimeTable',
		component: TimeTable,
		parameters: {
			layout: 'fullscreen',
		},
	});

	const items = itemizeCourseList(allCourses.slice(0, 3));
</script>

<Story name="Empty" />
<Story
	name="Filled"
	args={{
		items,
	}}
/>
<Story
	name="With preview"
	args={{
		items: items.slice(0, -2),
		preview: items.slice(-2),
	}}
/>

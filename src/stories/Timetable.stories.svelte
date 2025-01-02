<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import allCourses from '../fullcourses.json';
	import { itemizeCourse } from '$lib/utils';

	const { Story } = defineMeta({
		title: 'TimeTable',
		component: TimeTable,
		parameters: {
			layout: 'fullscreen'
		}
	});

	const items = itemizeCourse(allCourses[0])
		.slice(0, 4)
		.concat(itemizeCourse(allCourses[1]).slice(2));
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
		items: items.slice(0, -2),
		preview: items.slice(-2)
	}}
/>

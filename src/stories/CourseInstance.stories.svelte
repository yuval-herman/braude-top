<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CourseCard from '$lib/components/CourseCard.svelte';
	import allCourses from '../fullcourses.json';
	const { Story } = defineMeta({
		title: 'CourseCard',
		component: CourseCard
	});
</script>

<Story
	name="Course"
	args={{ course: allCourses.find((c) => c.instances.some((i) => i.sessions.length)) }}
/>
<Story
	name="Lots of sessions"
	args={{ course: allCourses.find((c) => c.instances.some((i) => i.sessions.length > 3)) }}
/>

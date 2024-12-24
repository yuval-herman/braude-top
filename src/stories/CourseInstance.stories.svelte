<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CourseInstance from '$lib/components/CourseInstance.svelte';

	const { Story } = defineMeta({
		title: 'CourseInstance',
		component: CourseInstance
		// parameters: {
		// 	layout: 'fullscreen'
		// }
	});
	const instance = {
		course_id: 11003,
		course_instance_id: 474,
		instructor: "פרופ' ילין מרק",
		type: 'הרצאה',
		hours: 4.0,
		group_name: '251200111',
		is_full: 0,
		language: 'עברית',
		extra_notes:
			'מכונות ( קבוצות הקשורות לקורס זה : 251200111 /  1 , 251200111 /  2 , 251200111 /  3 , 251200111 /  4 , 251200111 /  5 , 251200111 /  6 , 251200111 /  7 , 251200111 /  8 , 251200111 /  9 )'
	};

	const sessions = [
		{
			course_instance_id: 474,
			semester: 'א',
			week_day: 'ג',
			start_time: '08:30',
			end_time: '10:30',
			room: '303 EM'
		},
		{
			course_instance_id: 474,
			semester: 'א',
			week_day: 'ד',
			start_time: '10:30',
			end_time: '12:20',
			room: '102 EM'
		}
	];
</script>

<Story name="Course" args={{ instance, sessions }} />
<Story name="Lots of sessions" args={{ instance, sessions: Array(4).fill(sessions).flat() }} />
<Story name="Full Course" args={{ instance: { ...instance, is_full: 1 }, sessions }} />

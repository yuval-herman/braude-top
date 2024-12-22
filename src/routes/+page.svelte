<script lang="ts">
	import TimeTable from '$lib/components/TimeTable.svelte';
	import PaginatedList from '$lib/components/PaginatedList.svelte';
	import type { CourseInstance, Item, Session } from '$lib/types.js';
	import { hoursList } from '$lib/utils.js';

	const { data } = $props();
	const selectedItems = $state<Item[]>([]);
</script>

<main>
	<PaginatedList
		items={data.courses.map((course) => ({
			display: course.name,
			async onclick() {
				const instances = (await (
					await fetch('/db/instance/' + course.course_id)
				).json()) as CourseInstance[];
				const sessions = (await (
					await fetch('/db/sessions/' + instances[0].course_instance_id)
				).json()) as Session[];
				for (const session of sessions) {
					const startDay = 1487; // unicode codepoint, we want a 1 based day number
					const day = session.week_day.charCodeAt(0) - startDay;
					console.log(session.start_time);
					let time = session.start_time.split(':').map(Number);

					const start =
						hoursList.findIndex(({ hour, min }) => time[0] === hour && time[1] === min) + 1;
					time = session.end_time.split(':').map(Number);

					const end =
						hoursList.findIndex(({ hour, min }) => time[0] === hour && time[1] === min) + 1;
					selectedItems.push({ day, start, end, value: course.name });
				}
			}
		}))}
	/>
	<TimeTable items={selectedItems} />
</main>

<style>
	main {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 2fr;
	}
</style>

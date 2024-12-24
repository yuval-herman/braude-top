<script lang="ts">
	import PaginatedList from '$lib/components/PaginatedList.svelte';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import type { Item } from '$lib/types.js';
	import { hoursList } from '$lib/utils.js';

	const { data } = $props();
	const selectedItems = $state<Item[]>([]);

	function timeIndex(timestring: string) {
		const [chour, cmin] = timestring.split(':').map(Number);
		const index = hoursList.findIndex(({ hour, min }) => hour === chour && min === cmin);
		return index === -1 ? undefined : index + 1;
	}
</script>

<main>
	<PaginatedList
		items={data.full_courses.map((c) => ({
			...c,
			onclick(sessions) {
				sessions.forEach((s) => {
					const { week_day, start_time, end_time } = s;
					const first_day = 1488;
					const day = week_day.charCodeAt(0) - first_day;
					const t = {
						value: c.name,
						day,
						start: timeIndex(start_time),
						end: timeIndex(end_time)
					};
					console.log(t);

					selectedItems.push(t);
				});
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

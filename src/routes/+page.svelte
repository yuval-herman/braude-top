<script lang="ts">
	import PaginatedList from '$lib/components/PaginatedList.svelte';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import { hoveredInstance } from '$lib/state.svelte.js';
	import type { Item } from '$lib/types.js';
	import { itemizeSession } from '$lib/utils.js';

	const { data } = $props();
	let searchQuery = $state('');
	$effect(() => {
		searchQuery = searchQuery.toLowerCase();
	});
	const filteredCourses = $derived(
		data.full_courses.filter((c) => c.name.toLowerCase().includes(searchQuery))
	);
	const selectedItems = $state<Item[]>([]);
	const shownItems = $derived(selectedItems.concat(hoveredInstance.items));
</script>

<main>
	<div class="course-selection">
		<input type="text" bind:value={searchQuery} />
		<PaginatedList
			items={filteredCourses.map((c) => ({
				...c,
				onclick(sessions) {
					sessions.forEach((s) => selectedItems.push({ ...itemizeSession(s), value: c.name }));
				}
			}))}
		/>
	</div>
	<TimeTable items={shownItems} />
</main>

<style>
	main {
		padding: 12px;
		height: 100%;
		display: grid;
		gap: 12px;
		grid-template-columns: 1fr 2fr;
	}
	.course-selection {
		display: flex;
		flex-direction: column;
		gap: 8px;
		height: 100%;
		overflow: hidden;
	}
	input {
		padding: 8px;
		border-radius: 8px;
		border: 1px solid #ccc;
	}
</style>

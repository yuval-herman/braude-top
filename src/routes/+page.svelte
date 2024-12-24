<script lang="ts">
	import PaginatedList from '$lib/components/PaginatedList.svelte';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import { hoveredInstance } from '$lib/state.svelte.js';
	import type { Item } from '$lib/types.js';
	import { hoursList, itemizeSession } from '$lib/utils.js';

	const { data } = $props();
	const selectedItems = $state<Item[]>([]);
	const shownItems = $derived(selectedItems.concat(hoveredInstance.items));
</script>

<main>
	<PaginatedList
		items={data.full_courses.map((c) => ({
			...c,
			onclick(sessions) {
				sessions.forEach((s) => selectedItems.push({ ...itemizeSession(s), value: c.name }));
			}
		}))}
	/>
	<TimeTable items={shownItems} />
</main>

<style>
	main {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 2fr;
	}
</style>

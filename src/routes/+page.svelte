<script lang="ts">
	import PaginatedList from '$lib/components/PaginatedList.svelte';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import type { Item } from '$lib/types.js';

	const { data } = $props();
	const selectedItems = $state<Item[]>([]);
</script>

<main>
	<PaginatedList items={data.full_courses} />
	<TimeTable items={selectedItems} />
</main>

<style>
	main {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 2fr;
	}
</style>

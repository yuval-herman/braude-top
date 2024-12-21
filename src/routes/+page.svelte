<script lang="ts">
	import TimeTable from '$lib/components/TimeTable.svelte';
	import PaginatedList from '$lib/components/PaginatedList.svelte';

	const { data } = $props();
	$inspect(data);
</script>

<main>
	<PaginatedList items={data.courseNames} />
	<TimeTable items={[{ value: 'test', day: 3, end: 6, start: 2 }]} />
</main>

<style>
	main {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 2fr;
	}
</style>

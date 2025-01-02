<script lang="ts">
	import MenuButton from '$lib/components/MenuButton.svelte';
	import PaginatedList from '$lib/components/PaginatedList.svelte';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import { hoveredInstance, selectedCourses, sidebar } from '$lib/state.svelte.js';
	import { itemizeCourse } from '$lib/utils.js';

	const { data } = $props();
	let searchQuery = $state('');
	$effect(() => {
		searchQuery = searchQuery.toLowerCase();
	});
	const filteredCourses = $derived(
		data.full_courses.filter((c) => c.name.toLowerCase().includes(searchQuery))
	);

	let tab = $state<'all' | 'my'>('all');
</script>

<main>
	<div class="selector" class:hidden={!sidebar.isOpen}>
		<nav>
			<div class="menu-button">
				<MenuButton />
			</div>
			<button onclick={() => (tab = 'all')}>כל הקורסים</button>
			<button onclick={() => (tab = 'my')}>הקורסים שלי</button>
		</nav>
		<div style:display={tab === 'all' ? 'contents' : 'none'}>
			<input type="text" bind:value={searchQuery} />
			<PaginatedList items={filteredCourses} />
		</div>
		<div style:display={tab === 'my' ? 'contents' : 'none'}>
			<PaginatedList items={selectedCourses} mode="my" />
		</div>
	</div>
	<div class="table-container" class:hidden={sidebar.isOpen}>
		<TimeTable items={selectedCourses.flatMap(itemizeCourse)} preview={hoveredInstance.items} />
	</div>
</main>

<style>
	.menu-button {
		display: none;
		position: relative;
	}
	main {
		padding: 12px;
		height: 100%;
		display: grid;
		gap: 12px;
		grid-template-columns: 1fr 3fr;
		.table-container {
			display: contents;
		}
		@media (max-width: 770px) {
			display: block;
			font-size: medium;
			.menu-button {
				display: block;
			}
			.hidden {
				display: none;
			}
			nav {
				height: 10rem;
			}
		}
	}
	.selector {
		display: flex;
		flex-direction: column;
		gap: 8px;
		height: 100%;
		overflow: hidden;
		padding: 8px;
		border-radius: 8px;
		& input {
			padding: 8px;
			border-radius: 8px;
			border: 1px solid #ccc;
		}
		& nav {
			display: flex;
			gap: 6px;
			& > * {
				flex-grow: 1;
			}
		}
	}
</style>

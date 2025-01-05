<script lang="ts">
	import { slide } from 'svelte/transition';
	import CourseCard from './CourseCard.svelte';

	interface Props {
		itemPerPage?: number;
		mode?: 'all' | 'my';
		items: FullCourse[];
	}
	const { itemPerPage = 10, items, mode = 'all' }: Props = $props();
	let currentPage = $state(0);

	const lastPage = $derived(Math.floor(items.length / itemPerPage));
	const pageItems = $derived(
		items.slice(itemPerPage * currentPage, itemPerPage * (currentPage + 1))
	);
	$effect(() => {
		if (pageItems.length === 0) currentPage = 0;
	});
</script>

<div class="container">
	{#if lastPage != 0}
		<header>
			<nav>
				<button onclick={() => (currentPage--, currentPage < 0 && (currentPage = lastPage))}
					>הקודם</button
				>
				<button onclick={() => (currentPage = (currentPage + 1) % (lastPage + 1))}>הבא</button>
			</nav>
			<span id="page-counter">עמ' {currentPage + 1}</span>
		</header>
	{/if}
	<ul>
		{#each pageItems as course (course.course_id)}
			<li transition:slide>
				<CourseCard {course} {mode} />
			</li>
		{/each}
	</ul>
</div>

<style>
	.container {
		max-height: 100%;
		max-width: 100%;
		overflow: hidden;
		display: flex;
		gap: 8px;
		flex-direction: column;
		flex-grow: 1;
		header {
			display: flex;
			justify-content: space-between;
			button {
				padding: 4px 8px;
				border-radius: 4px;
			}
		}
		#page-counter {
			border-radius: 4px;
			padding: 4px;
			margin: 4px;
		}
		ul {
			flex-grow: 1;
			list-style-type: none;
			margin: 0;
			border-radius: 12px;
			overflow-y: scroll;
			scrollbar-width: none; /* TODO: make a manual scrollbar, chrome's scrollbar looks awful and safari does not support styling... */
			padding: 8px;
			padding-right: 12px;
			li {
				margin-bottom: calc(32px);
				box-shadow: 5px 5px 5px var(--shadow);
				border-radius: 8px;
			}
		}
	}
</style>

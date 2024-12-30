<script lang="ts">
	import type { FullCourse } from '$lib/types';
	import CourseCard from './CourseCard.svelte';

	interface Props {
		itemPerPage?: number;
		items: FullCourse[];
	}
	const { itemPerPage = 10, items }: Props = $props();
	let currentPage = $state(0);

	const lastPage = $derived(Math.floor(items.length / itemPerPage));
	const pageItems = $derived(
		items.slice(itemPerPage * currentPage, itemPerPage * (currentPage + 1))
	);
</script>

<div class="container">
	<header>
		<nav>
			<button onclick={() => (currentPage--, currentPage < 0 && (currentPage = lastPage))}
				>הקודם</button
			>
			<button onclick={() => (currentPage = (currentPage + 1) % (lastPage + 1))}>הבא</button>
		</nav>
		<span id="page-counter">עמ' {currentPage + 1}</span>
	</header>
	<ul>
		{#each pageItems as course}
			<li>
				<CourseCard {course} />
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
				background-color: var(--top-bg);
			}
		}
		#page-counter {
			background-color: var(--top-bg);
			border-radius: 4px;
			padding: 4px;
			margin: 4px;
		}
		ul {
			--gap: 64px;
			display: flex;
			gap: calc(var(--gap) / 2);
			flex-direction: column;
			background-color: var(--bg);
			list-style-type: none;
			margin: 0;
			flex-grow: 1;
			border-radius: 12px;
			overflow-y: scroll;
			scrollbar-width: none; /* TODO: make a manual scrollbar, chrome's scrollbar looks awful and safari does not support styling... */
			padding: 8px;
			padding-right: 12px;
			li {
				flex-shrink: 0;
				border: var(--top-bg) solid;
				&:not(:last-child) {
					padding-bottom: calc(var(--gap) / 2);
					border-bottom: solid var(--border) 1px;
				}
			}
		}
	}
</style>

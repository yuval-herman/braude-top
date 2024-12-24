<script lang="ts">
	import { hoveredInstance } from '$lib/state.svelte';
	import type { Session, CourseInstance, Course } from '$lib/types';
	import { itemizeSession } from '$lib/utils';
	import CourseInstanceC from './CourseInstance.svelte';

	interface Props<OnclickParam = unknown> {
		itemPerPage?: number;
		items: (Course & {
			onclick: (instance: CourseInstance, sessions: Session[]) => void;
			instances: (CourseInstance & { sessions: Session[] })[];
		})[];
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
				<h3>{course.name}</h3>
				<div class="instances">
					{#each course.instances as instance}
						<div
							onpointerover={() =>
								(hoveredInstance.items = instance.sessions.map((s) => ({
									...itemizeSession(s),
									value: { name: course.name, instructor: instance.instructor, room: s.room }
								})))}
							onpointerleave={() => (hoveredInstance.items = [])}
						>
							<CourseInstanceC
								{instance}
								onclick={() => course.onclick(instance, instance.sessions)}
								sessions={instance.sessions}
							/>
						</div>
					{/each}
				</div>
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
		flex-direction: column;
		flex-grow: 1;
	}
	header {
		display: flex;
		justify-content: space-between;
	}
	h3 {
		white-space: wrap;
	}
	#page-counter {
		background-color: var(--top-bg);
		border-radius: 4px;
		padding: 4px;
		margin: 4px;
	}
	ul {
		margin: 0;
		padding: 0;
		flex-grow: 1;
		list-style-type: none;
		margin: 0;
		padding: 0;
		background-color: var(--bg);
		padding: 8px;
		border-radius: 12px;
		overflow: scroll;
	}
	li {
		border: var(--top-bg) solid;
		margin: 12px;
		padding: 8px;
		padding-right: 16px;
		border-radius: 12px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	button {
		padding: 4px 8px;
		border-radius: 4px;
		background-color: var(--top-bg);
	}
	.instances {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>

<script lang="ts">
	import MenuButton from '$lib/components/MenuButton.svelte';
	import PaginatedList from '$lib/components/PaginatedList.svelte';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import { hoveredInstance, selectedCourses, sidebar, undoStack } from '$lib/state.svelte.js';
	import { itemizeCourseList } from '$lib/utils.js';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import type { KeyboardEventHandler } from 'svelte/elements';
	import { fly, slide, type FlyParams } from 'svelte/transition';

	const { data } = $props();
	let searchQuery = $state('');
	$effect(() => {
		searchQuery = searchQuery.toLowerCase();
	});
	const filteredCourses = $derived(
		data.full_courses.filter((c) => c.name.toLowerCase().includes(searchQuery))
	);

	let tab = $state<'all' | 'my'>('all');

	const onkeydown: KeyboardEventHandler<Window> = (e) => {
		if (e.metaKey || e.ctrlKey) {
			if (e.code === 'KeyZ') {
				if (e.shiftKey) {
					// redoStack.pop()?.();
					// TODO
				} else {
					undoStack.pop()?.();
				}
			} else if (e.code === 'KeyY') {
				// redoStack.pop()?.();
				// TODO
			}
		}
	};

	function tabTransition(tab: 'all' | 'my', dir: 'in' | 'out'): FlyParams {
		const easing = dir === 'in' ? cubicOut : cubicIn;
		const duration = 200;
		const delay = dir === 'in' ? duration : 0;
		const x = 100;
		return { duration, easing, delay, x: tab === 'all' ? x : -x };
	}
</script>

<svelte:window {onkeydown} />
<main>
	<div class="selector" class:hidden={!sidebar.isOpen}>
		<nav>
			<div class="menu-button">
				<MenuButton />
			</div>
			<button onclick={() => (tab = 'all')}>כל הקורסים</button>
			<button onclick={() => (tab = 'my')}>הקורסים שלי</button>
		</nav>

		{#if tab === 'all'}
			<div
				class="list-container"
				in:fly={tabTransition('all', 'in')}
				out:fly={tabTransition('all', 'out')}
			>
				<input type="text" bind:value={searchQuery} />
				<PaginatedList items={filteredCourses} />
			</div>
		{:else}
			<div
				class="list-container"
				in:fly={tabTransition('my', 'in')}
				out:fly={tabTransition('my', 'out')}
			>
				{#if selectedCourses.length === 0}
					<p class="warn" transition:slide>
						כדי לראות קורסים צריך לבחור אותם בלשונית <b>'כל הקורסים'</b>
					</p>
				{/if}
				<PaginatedList items={selectedCourses} mode="my" />
			</div>
		{/if}
	</div>
	<div class="table-container" class:hidden={sidebar.isOpen}>
		<TimeTable items={itemizeCourseList(selectedCourses)} preview={hoveredInstance.items} />
	</div>
</main>

<style>
	.warn {
		color: var(--warn);
		text-align: center;
		margin: 1.5rem;
	}

	main {
		padding: 12px;
		height: 100%;
		overflow: hidden;
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

		.list-container {
			display: grid;
			gap: 12px;
			max-height: 100%;
			overflow: hidden;
		}
		& input {
			padding: 8px;
			border-radius: 8px;
			border: 1px solid #ccc;
			width: 100%;
		}
		& nav {
			min-height: 2rem;
			display: flex;
			gap: 6px;
			& > * {
				flex-grow: 1;
			}
		}
	}
	.menu-button {
		display: none;
		position: relative;
	}
</style>

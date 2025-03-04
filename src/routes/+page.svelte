<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import PaginatedList from '$lib/components/PaginatedList.svelte';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import {
		getActiveCourses,
		getActiveFullCourses,
		getActiveInstances,
		getCoursesAmount,
		getFullCourses,
		redo,
		removeAllCoursesData,
		saveSnapshotToUndo,
		undo,
	} from '$lib/courseManager.svelte.js';
	import { showHelp } from '$lib/help.js';
	import { hoveredItems, selectedEmptyRooms } from '$lib/state.svelte.js';
	import { TypedLocalStorage } from '$lib/storage.js';
	import { itemizeCourseList, itemizeEmptyRoom } from '$lib/utils/item.utils.js';
	import { debounce } from '$lib/utils/utils.js';
	import { onMount } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import type { KeyboardEventHandler } from 'svelte/elements';
	import { fly, slide, type FlyParams } from 'svelte/transition';

	const { data } = $props();
	let tab = $state<'all' | 'my'>('all');

	onMount(() => {
		if (!TypedLocalStorage.getItem('onboarded')) {
			showHelp(page);
			TypedLocalStorage.setItem('onboarded', true);
		}
	});

	const onkeydown: KeyboardEventHandler<Window> = (e) => {
		if (e.metaKey || e.ctrlKey) {
			if (e.code === 'KeyZ') {
				if (e.shiftKey) redo();
				else undo();
			} else if (e.code === 'KeyY') redo();
		}
	};

	function tabTransition(tab: 'all' | 'my', dir: 'in' | 'out'): FlyParams {
		const easing = dir === 'in' ? cubicOut : cubicIn;
		const duration = 200;
		const delay = dir === 'in' ? duration : 0;
		const x = 100;
		return { duration, easing, delay, x: tab === 'all' ? x : -x };
	}

	function initialInput(node: HTMLInputElement) {
		node.value = page.url.searchParams.get('query') ?? '';
	}

	export const snapshot = {
		capture: () => tab,
		restore: (value) => (tab = value),
	};
</script>

<svelte:head>
	<meta
		name="description"
		content="תכנון מערכת שעות מעולם לא היה קל יותר! בראודה טופ מציע מגוון כלים שיסייעו לך לארגן את השבוע ולשלב לימודים ומנוחה בצורה מאוזנת."
	/>
</svelte:head>

<svelte:window {onkeydown} />
<main>
	<div class="selector" class:hidden={!page.state.sidebarOpen}>
		<nav>
			<div class="menu-button">
				<MenuButton />
			</div>
			<button id="all-courses" onclick={() => (tab = 'all')}>כל הקורסים</button>
			<button id="my-courses" onclick={() => (tab = 'my')}>הקורסים שלי</button>
		</nav>

		{#if tab === 'all'}
			<div
				class="list-container"
				in:fly={tabTransition('all', 'in')}
				out:fly={tabTransition('all', 'out')}
			>
				<input
					id="course-query"
					type="text"
					placeholder="חפש כאן..."
					use:initialInput
					oninput={debounce((ev) => {
						if (!(ev.target instanceof HTMLInputElement)) return;
						const { value } = ev.target;
						const url = new URL(page.url);
						url.searchParams.set('query', value.toLowerCase());
						goto(url, { replaceState: true, state: page.state, keepFocus: true });
					}, 300)}
				/>
				{#if data.full_courses?.length}
					<PaginatedList items={data.full_courses} />
				{:else}
					<i class="info" transition:slide>חפש קורסים בתיבת החיפוש!</i>
				{/if}
			</div>
		{:else}
			<div
				class="list-container"
				in:fly={tabTransition('my', 'in')}
				out:fly={tabTransition('my', 'out')}
			>
				{#if getCoursesAmount() === 0}
					<p class="warn" transition:slide>
						כדי לראות קורסים צריך לבחור אותם בלשונית <b>'כל הקורסים'</b>
					</p>
				{:else}
					<button
						transition:slide
						onclick={() => {
							if (confirm('מערכת השעות הולכת להמחק, להמשיך?')) {
								saveSnapshotToUndo();
								removeAllCoursesData();
							}
						}}>מחק הכל</button
					>
					{@const activeInstances = getActiveInstances()}
					{@const activeCourses = getActiveCourses()}
					{@debug activeCourses}
					<div transition:slide class="small-info">
						<span>נ"ז {activeCourses.reduce((p, c) => p + c.credit, 0)}</span><span
							>שעות לימוד {activeInstances.reduce((p, c) => p + c.hours, 0)}</span
						>
					</div>
				{/if}

				<PaginatedList items={getFullCourses()} mode="my" />
			</div>
		{/if}
	</div>
	<div class="table-container" class:hidden={page.state.sidebarOpen}>
		<TimeTable
			items={itemizeCourseList(getActiveFullCourses()).concat(
				selectedEmptyRooms.map(itemizeEmptyRoom)
			)}
			preview={hoveredItems.items}
		/>
	</div>
</main>

<style>
	.warn {
		color: var(--warn);
		text-align: center;
		margin: 1.5rem;
	}
	.info {
		color: var(--info);
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
			.small-info {
				background: var(--info);
				border-radius: 8px;
				padding: 4px 8px;
				span {
					margin: 4px;
				}
			}
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

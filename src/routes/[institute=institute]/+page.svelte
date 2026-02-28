<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import PaginatedList from '$lib/components/PaginatedList.svelte';
	import TimeTable from '$lib/components/TimeTable.svelte';
	import {
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
	import type { KeyboardEventHandler } from 'svelte/elements';
	import { slide } from 'svelte/transition';

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
				if (e.shiftKey) redo(data.institute);
				else undo(data.institute);
			} else if (e.code === 'KeyY') redo(data.institute);
		}
	};

	function initialInput(node: HTMLInputElement) {
		if (node.id === 'course-name-query') node.value = page.url.searchParams.get('name-query') ?? '';
		if (node.id === 'course-id-query') node.value = page.url.searchParams.get('id-query') ?? '';
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
			<div class="list-container">
				<div class="query-box">
					<input
						id="course-name-query"
						type="text"
						placeholder="חפש כאן..."
						use:initialInput
						oninput={debounce((ev) => {
							if (!(ev.target instanceof HTMLInputElement)) return;
							const { value } = ev.target;
							const url = new URL(page.url);
							url.searchParams.set('name-query', value.toLowerCase());
							goto(url, { replaceState: true, state: page.state, keepFocus: true });
						}, 300)}
					/>
					<input
						id="course-id-query"
						type="text"
						inputmode="numeric"
						pattern="\d*"
						placeholder="קוד קורס"
						use:initialInput
						oninput={debounce((ev) => {
							if (!(ev.target instanceof HTMLInputElement)) return;
							const { value } = ev.target;
							const url = new URL(page.url);
							url.searchParams.set('id-query', value);
							goto(url, { replaceState: true, state: page.state, keepFocus: true });
						}, 300)}
					/>
				</div>
				{#if data.full_courses.length}
					<PaginatedList institute={data.institute} items={data.full_courses} />
				{:else}
					<i class="info" transition:slide>חפש קורסים בתיבת החיפוש!</i>
				{/if}
			</div>
		{:else if tab === 'my'}
			<div class="list-container">
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
								removeAllCoursesData(data.institute);
							}
						}}>מחק הכל</button
					>
					{@const activeInstances = getActiveInstances()}
					<div transition:slide class="small-info">
						<!-- This means that if a user activates more then one instance with a credit for the same 
						course it might show an incorrect number. On the other hand, this might be correct 
						behaviour in some cases. If users report issues I will investigate this. -->
						<span>נ"ז {activeInstances.reduce((p, c) => p + c.credit, 0)}</span><span
							>שעות לימוד {activeInstances.reduce((p, c) => p + c.hours, 0)}</span
						>
					</div>
				{/if}
				<PaginatedList institute={data.institute} items={getFullCourses()} mode="my" />
			</div>
		{/if}
	</div>
	<div class="table-container" class:hidden={page.state.sidebarOpen}>
		<TimeTable
			items={itemizeCourseList(data.institute, getActiveFullCourses()).concat(
				selectedEmptyRooms.map((r) => itemizeEmptyRoom(data.institute, r))
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
		height: 100%;
		overflow: hidden;
		padding: 8px;
		border-radius: 8px;

		& nav {
			margin-bottom: 8px;
			min-height: 2rem;
			display: flex;
			gap: 6px;
			& > * {
				flex-grow: 1;
			}
		}
		& input {
			padding: 8px;
			border-radius: 8px;
			border: 1px solid #ccc;
		}
		.list-container {
			display: flex;
			flex-direction: column;
			gap: 12px;
			height: 100%;
			overflow: hidden;

			.query-box {
				display: flex;
				gap: 8px;

				& input {
					flex: 1 1 0;
					min-width: 70px;
				}

				#course-name-query {
					flex-grow: 40;
				}
			}
		}
	}
	.small-info {
		background: var(--info);
		border-radius: 8px;
		padding: 4px 8px;
		span {
			margin: 4px;
		}
	}
	.menu-button {
		display: none;
		position: relative;
		min-width: 40px;
	}
</style>

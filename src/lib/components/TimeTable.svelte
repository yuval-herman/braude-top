<script lang="ts">
	import { buildings, css, getDay, getHour, hoursList, walkTimes } from '$lib/utils';
	import Indicator from './Indicator.svelte';
	import MenuButton from './MenuButton.svelte';

	const { items = [], preview: previewItems = [] }: { items?: Item[]; preview?: Item[] } = $props();
	const itemsByDay = $derived(
		splitToDays(items.concat(previewItems.map((p) => ({ ...p, is_preview: true }))))
	);

	function splitToDays(items: Item[]) {
		items.sort((a, b) => a.day - b.day || a.start - b.start || a.end - b.end);
		const daysArr: Item[][] = Array(6);
		for (let i = 0; i < items.length; i++) {
			if (!daysArr[items[i].day]) daysArr[items[i].day] = [];
			else {
				const prevItem = items[i - 1];
				const prevBuilding = getBuilding(prevItem);
				const building = getBuilding(items[i]);
				if (prevBuilding && building && prevBuilding !== building) {
					// @ts-expect-error
					const walk: { dist: number; time: number } = walkTimes[prevBuilding][building];
					prevItem.walk = { ...walk, freeTime: items[i].start - prevItem.end };
				}
			}
			daysArr[items[i].day].push(items[i]);
		}
		return daysArr;

		function getBuilding(prevItem: Item) {
			return buildings.find((b) => prevItem.value.room.includes(b));
		}
	}
</script>

{#snippet Item(item: Item, index: number)}
	{@const background = (item.overlapping?.overlapIndex ?? 0) < 2 ? item.bgColor : 'red'}
	<div
		class="item"
		class:preview={item.is_preview}
		class:overlap={item.overlapping && item.overlapping.overlapIndex < 2}
		style:--overlap-index={(item.overlapping?.overlapIndex ?? 0) < 2
			? item.overlapping?.overlapIndex
			: undefined}
		style:--item-bg={background}
		style:color={css.a11y.getContrast({
			background,
			light: 'var(--text-light)',
			dark: 'var(--text-dark)',
		})}
		style:top="calc({item.start - 1} * (100% + 1px))"
		style:height="calc({item.end - item.start} * (100% + 1px) {item.walk && !item.overlapping
			? '- 2em'
			: ''})"
		style:z-index={index}
	>
		<Indicator color={item.indicatorColor} />
		<span>{item.type}</span>
		<span>{item.value.name}</span>
		<span>{item.value.instructor}</span>
		<span>{item.value.room}</span>
	</div>
	{#if item.walk && !item.overlapping}
		<div
			class="walk-time"
			class:preview={item.is_preview}
			style:top="calc({item.start - 1} * (100% + 1px) + {item.end - item.start} * (100% + 1px) - 2em)"
			style:height="2em"
		>
			<span>{item.walk.time}</span>
			{#if item.walk.freeTime === 0 && item.walk.time > 7}
				<svg
					height="1.5em"
					stroke="var(--text)"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					><path
						d="M14 22v-5.039a2 2 0 0 0-.75-1.561L11.5 14m0 0L13 7.5M11.5 14 10 13m3-5.5L11 7m2 .5 2.043 3.268a2 2 0 0 0 1.303.901L18 12m-8 1 1-6m-1 6-.6 3.3a2 2 0 0 1-2.542 1.557L4 17m7-10L8.106 8.447A2 2 0 0 0 7 10.237V12m7.5-8.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/></svg
				>
			{:else}
				<svg
					height="1.5em"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--text)"
					xmlns="http://www.w3.org/2000/svg"
					><path
						d="M14 22v-5.039a2 2 0 0 0-.75-1.561L11.5 14m0 0L13 7.5M11.5 14 10 13m3-5.5L11 7m2 .5 2.043 3.268a2 2 0 0 0 1.303.901L18 12m-8 1 1-6m-1 6-2 9m3-15L8.106 8.447A2 2 0 0 0 7 10.237V12m7.5-8.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/></svg
				>
			{/if}
		</div>
	{/if}
{/snippet}

<table>
	<thead>
		<tr>
			<th><MenuButton /></th>
			{#each { length: 6 } as _, day}
				<th>{getDay(day)} </th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each hoursList as hour, row}
			<tr>
				<th class="hour">{getHour(hour.hour, hour.min)}</th>
				{#if row === 0}
					{#each itemsByDay as dayItems, i}
						<td>
							{#each dayItems as item}
								{@render Item(item, 10 * (6 - i) + item.start)}
							{/each}
						</td>
					{/each}
				{:else}
					{#each { length: itemsByDay.length } as _}
						<td></td>
					{/each}
				{/if}
			</tr>
			{#if row === 4}
				<tr>
					<th class="hour lunch">הפסקת צהריים</th>

					{#each { length: itemsByDay.length } as _}
						<td></td>
					{/each}
				</tr>
			{/if}
		{/each}
	</tbody>
</table>

<style>
	table {
		background: var(--bg);
		box-shadow: 5px 5px 5px 5px var(--shadow);
		border-collapse: collapse;
		table-layout: fixed;
		height: 100%;
		width: 100%;
		border-radius: 12px;
	}

	th,
	td {
		border: 1px solid #ccc;
	}

	thead {
		height: calc(100% / 19);
		th {
			border-top: none;
		}
	}
	th:last-child,
	td:last-child {
		border-left: none;
	}
	th:first-child {
		border-right: none;
	}
	tbody tr:last-child :is(td, th) {
		border-bottom: none;
	}

	th,
	td {
		position: relative;
		height: calc(100% / 19);
	}

	.lunch,
	.lunch ~ td {
		background: var(--shadow);
	}

	.item {
		display: grid;
		place-items: center;

		position: absolute;
		width: 100%;
		left: 0;
		padding: 6px;
		padding-right: 10px;

		text-align: center;
		font-size: small;
		overflow: hidden;
		white-space: wrap;
		word-break: break-all;

		background: var(--item-bg);
		border-radius: 16px;
		box-shadow: 5px 5px 5px var(--shadow);
		&.preview {
			opacity: 50%;
		}
	}

	.walk-time {
		display: flex;
		justify-content: center;
		gap: 8px;
		align-items: center;
		position: absolute;
		width: 100%;
		text-align: center;
		padding: 4px;
		font-size: smaller;
		background: var(--info);
		border-radius: 8px;
		z-index: 1000;
	}

	.overlap {
		width: 50%;
		left: calc(50% * var(--overlap-index));
	}

	@media (max-width: 480px) {
		.hour {
			font-size: small;
		}
		.item {
			font-size: x-small;
		}
	}
	@media (max-width: 400px) {
		th {
			font-size: small;
		}
		.hour {
			font-size: x-small;
		}
		.item {
			font-size: xx-small;
		}
	}
</style>

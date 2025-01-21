<script lang="ts">
	import { settings } from '$lib/settings.svelte';
	import { buildings, hoursList, walkTimes } from '$lib/utils/constants.utils';
	import { getContrast } from '$lib/utils/css.utils';
	import { getDay, getHour } from '$lib/utils/formatter.utils';
	import { sameObject } from '$lib/utils/utils';
	import Indicator from './Indicator.svelte';
	import MenuButton from './MenuButton.svelte';

	const { items = [], preview: previewItems = [] }: { items?: Item[]; preview?: Item[] } = $props();

	const processed = $derived.by(() => {
		const processed: Item[] = [];
		const ignore: number[] = [];
		for (const i of items) {
			const index = previewItems.findIndex((p) => p && sameObject(i.value, p.value));
			if (index !== -1) {
				ignore.push(index);
				processed.push({ ...i, highlight: true });
			} else {
				processed.push(i);
			}
		}

		return processed.concat(
			previewItems.filter((_, i) => !ignore.includes(i)).map((i) => ({ ...i }))
		);
	});
	const itemsByDay = $derived(splitToDays(processed));

	function splitToDays(items: Item[]) {
		items.sort((a, b) => a.day - b.day || a.start - b.start || a.end - b.end);
		const daysArr: Item[][] = Array(6);
		for (let i = 0; i < items.length; i++) {
			if (!daysArr[items[i].day]) daysArr[items[i].day] = [];
			else if ($settings.show_walk_times) {
				const prevItem = items[i - 1];
				prevItem.freeTime = items[i].start - prevItem.end;

				const prevBuilding = getBuilding(prevItem);
				const building = getBuilding(items[i]);
				if (prevBuilding && building && prevBuilding !== building) {
					// @ts-expect-error
					const walk: { dist: number; time: number } = walkTimes[prevBuilding][building];
					prevItem.walk = walk;
				}
			}
			// set this to undefined on current item since if they were set previously and
			// the next item then got removed this will stay incorrectly
			items[i].walk = undefined;
			items[i].freeTime = undefined;
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
	{@const offset = item.walk && item.freeTime === 0 ? '- 2em' : ''}
	<div
		class="item"
		class:highlight={item.highlight}
		class:preview={item.is_preview}
		class:overlap={item.overlapping && item.overlapping.overlapIndex < 2}
		style:--overlap-index={(item.overlapping?.overlapIndex ?? 0) < 2
			? item.overlapping?.overlapIndex
			: undefined}
		style:--item-bg={background}
		style:color={getContrast({
			background,
			light: 'var(--text-light)',
			dark: 'var(--text-dark)',
		})}
		style:top="calc({item.start - 1} * (100% + 1px))"
		style:height="calc({item.end - item.start} * (100% + 1px) {offset})"
		style:z-index={index}
	>
		<Indicator color={item.indicatorColor} />
		<span>{item.type}</span>
		<span>{item.value.name}</span>
		<span>{item.value.instructor}</span>
		<span>{item.value.room}</span>
		<span>{item.freeTime}</span>
	</div>
	{#if (item.walk || item.freeTime) && !item.overlapping}
		<div
			class="walk-free"
			class:preview={item.is_preview}
			style:top="calc({item.start - 1} * (100% + 1px) + {item.end - item.start} * (100% + 1px) {offset})"
		>
			{#if item.walk}
				<div class="data">
					<span>{item.walk.time}</span>
					{#if item.freeTime === 0 && item.walk.time > 7}
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

			{#if item.freeTime}
				<div class="data">
					<span>{item.freeTime - 1} ש'</span>
					<svg
						width="1.5em"
						viewBox="0 0 24 24"
						fill="none"
						stroke="var(--text)"
						xmlns="http://www.w3.org/2000/svg"
						><path
							d="M12 9v4M10 2h4m3.657 5.343L19 6m-7 15a8 8 0 1 0 0-16 8 8 0 0 0 0 16"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/></svg
					>
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

<table style:--item-margin={$settings.columns_margins ? '5%' : '0'}>
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
			{#if row === 4 && $settings.show_lunch}
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

		--item-margin: 3%;
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
	.highlight {
		box-shadow: 0 0 15px yellow !important;
	}
	.overlap {
		width: calc(50% - var(--item-margin) * 2);
		left: calc(50% * var(--overlap-index) + var(--item-margin)) !important;
		right: unset !important;
	}
	.item {
		transition: box-shadow 0.5s;
		display: grid;
		place-items: center;

		position: absolute;
		left: var(--item-margin);
		right: var(--item-margin);

		padding: 6px;
		padding-right: 10px;

		text-align: center;
		font-size: small;
		overflow-x: hidden;
		overflow-y: auto;
		scrollbar-width: none;
		white-space: wrap;
		word-break: break-all;

		background: var(--item-bg);
		border-radius: 16px;
		box-shadow: 5px 5px 5px var(--shadow);
		&.preview {
			opacity: 50%;
		}
	}
	.walk-free {
		display: grid;
		place-content: center;
		position: absolute;
		left: var(--item-margin);
		right: var(--item-margin);
		text-align: center;
		padding: 4px;
		font-size: smaller;
		background: var(--info);
		border-radius: 8px;
		z-index: 1000;

		.data {
			display: flex;
			justify-content: center;
			gap: 8px;
			align-items: center;
		}
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

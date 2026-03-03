<script lang="ts">
	import { settings } from '$lib/settings.svelte';
	import { getContrast } from '$lib/utils/css.utils';
	import { getDay, getHour } from '$lib/utils/formatter.utils';
	import { sameObject } from '$lib/utils/utils';
	import Indicator from './Indicator.svelte';
	import MenuButton from './MenuButton.svelte';

	interface Props {
		items?: Item[];
		preview?: Item[];
		hoursList: { hour: number; min: number }[];
	}
	const { items = [], preview: previewItems = [], hoursList }: Props = $props();

	const processed = $derived.by(() => {
		const processed: Item[] = [];
		const ignore: number[] = [];
		for (const i of items) {
			const index = previewItems.findIndex(
				(p) =>
					p &&
					sameObject(p, i, ['day', 'start', 'end', 'type', 'value', 'bgColor', 'indicatorColor'])
			);
			if (index !== -1) {
				ignore.push(index);
				processed.push({ ...i, highlight: true });
			} else {
				processed.push({ ...i });
			}
		}

		return processed.concat(
			previewItems.filter((_, i) => !ignore.includes(i)).map((item) => ({ ...item }))
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
			}
			items[i].freeTime = undefined;
			daysArr[items[i].day].push(items[i]);
		}
		return daysArr;
	}
</script>

{#snippet Item(item: Item, index: number)}
	{@const background = (item.overlapping?.overlapIndex ?? 0) < 2 ? item.bgColor : 'red'}
	{@const offset = item.walk && item.freeTime === 0 ? '- 2em' : ''}
	{@const start = item.start}
	{@const end = item.end}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div
		role="gridcell"
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
		style:top="calc({start} * (100% + 1px))"
		style:height="calc({end - start} * (100% + 1px) {offset})"
		style:z-index={item.value.type === 'empty-room' ? 1 : index}
		style:cursor={item.onclick && 'pointer'}
		onmouseenter={item.onhover}
		onmouseleave={item.onstopHover}
		onclick={item.onclick}
	>
		{#if item.indicatorColor}<Indicator color={item.indicatorColor} />{/if}
		{#if 'session_type' in item.value}<span>{item.value.session_type}</span>{/if}
		<span>{item.value.name}</span>
		{#if 'instructor' in item.value}<span>{item.value.instructor}</span>{/if}
		{#if 'room' in item.value}<span>{item.value.room}</span>{/if}
	</div>
	{#if (item.walk || item.freeTime) && !item.overlapping}
		<div
			class="walk-free"
			class:preview={item.is_preview}
			style:top="calc({start} * (100% + 1px) + {end - start} * (100% + 1px) {offset})"
		>
			{#if item.walk}
				<div class="data">
					<span class="icon-{item.freeTime === 0 && item.walk.time > 7 ? 'run' : 'walk'}"
						>{item.walk.time}</span
					>
				</div>
			{/if}

			{#if item.freeTime}
				<div class="data">
					<span class="icon-clock">{item.freeTime} ש'</span>
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

<div class="container">
	<table
		style:--item-margin={$settings.columns_margins ? '5%' : '0'}
		style:--row-amount={hoursList.length + 1}
	>
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
			{/each}
		</tbody>
	</table>
</div>

<style>
	.container {
		display: block;
		overflow-y: scroll;
	}

	table {
		background: var(--bg);
		box-shadow: 5px 5px 5px 5px var(--shadow);
		border-collapse: collapse;
		table-layout: fixed;
		height: 100%;
		width: 100%;
		border-radius: 12px;
		--item-margin: 3%;
		z-index: 0;
	}

	th,
	td {
		border: 1px solid #ccc;
	}

	thead {
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
	}
	th,
	td,
	thead {
		height: calc(100% / var(--row-amount));
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

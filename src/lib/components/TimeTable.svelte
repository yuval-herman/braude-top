<script lang="ts">
	import { getDay, getHour, hoursList } from '$lib/utils';
	import type { Item } from '../types';

	const { items = [], preview: previewItems = [] }: { items?: Item[]; preview?: Item[] } = $props();
	function splitToDays(items: Item[]) {
		const daysArr = Array(6);
		for (let i = 0; i < items.length; i++) {
			if (!daysArr[items[i].day]) daysArr[items[i].day] = [];
			daysArr[items[i].day].push(items[i]);
		}
		return daysArr;
	}

	const itemsByDay = $derived(
		splitToDays(items.concat(previewItems.map((p) => ({ ...p, is_preview: true }))))
	);
</script>

{#snippet Item(item: Item & { is_preview: boolean })}
	<div
		class="item"
		class:preview={item.is_preview}
		style:top="calc({item.start - 1} * (100% + 1px))"
		style:height="calc({item.end - item.start} * (100% + 1px))"
	>
		{item.value.name}
		{item.value.instructor}
		{item.value.room}
	</div>
{/snippet}

<table>
	<thead>
		<tr>
			<th></th>
			{#each { length: 6 } as _, day}
				<th>{getDay(day)} </th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each hoursList as hour, row}
			<tr>
				<th>{getHour(hour.hour, hour.min)}</th>
				{#if row === 0}
					{#each itemsByDay as dayItems}
						<td>
							{#each dayItems as item}
								{@render Item(item)}
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

<style>
	table {
		border-collapse: collapse;
		table-layout: fixed;
		height: 100%;
		width: 100%;
		background-color: var(--bg);
		border-radius: 12px;
		--border-width: 1px;
	}

	th,
	td {
		height: calc(100% * - (15 / 16));
		border: 1px solid #ccc;
	}

	thead th {
		border-top: none;
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

	td {
		position: relative;
	}

	.item {
		text-align: center;
		font-size: small;
		z-index: 1;
		position: absolute;
		width: 100%;
		display: grid;
		place-items: center;
		left: 0;
		border: var(--border-width) solid black;
		background-color: var(--bg-secondary);
		overflow: hidden;
		white-space: wrap;
		word-break: break-all;
		&.preview {
			opacity: 50%;
		}
	}
</style>

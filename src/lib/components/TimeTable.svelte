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

<table>
	<thead>
		<tr>
			<th></th>
			{#each itemsByDay as dayItems, day}
				<th
					>{getDay(day)}
					{#each dayItems as item}
						<div
							class="item"
							class:preview={item.is_preview}
							style:top="calc({item.start} * (100% + 1px) - 1px)"
							style:height="calc({item.end - item.start} * (100% + 1px) - 1px)"
						>
							{item.value.name}
							{item.value.instructor}
							{item.value.room}
						</div>
					{/each}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each hoursList as hour}
			<tr>
				<th>{getHour(hour.hour, hour.min)}</th>
				{#each { length: itemsByDay.length } as _}
					<td></td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		border-collapse: collapse;
		height: 100%;
		width: 100%;
		background-color: var(--bg);
		border-radius: 12px;
	}

	th,
	td {
		width: calc(100% / 8);
		height: calc(100% * (1 / 16 - 1));
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

	th {
		position: relative;
	}

	.item {
		position: absolute;
		width: 100%;
		display: grid;
		place-items: center;
		left: 0;
		border: 1px solid black;
		background-color: var(--top-bg);
		overflow: hidden;
		white-space: wrap;
		word-break: break-all;
		&.preview {
			opacity: 50%;
		}
	}
</style>

<script lang="ts">
	import { getDay, getHour, hoursList, instanceColors } from '$lib/utils';
	import Indicator from './Indicator.svelte';
	import MenuButton from './MenuButton.svelte';

	const { items = [], preview: previewItems = [] }: { items?: Item[]; preview?: Item[] } = $props();
	function splitToDays(items: Item[]) {
		const daysArr: Item[][] = Array(6);
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

{#snippet Item(item: Item, index: number)}
	<div
		class="item"
		class:preview={item.is_preview}
		style:top="calc({item.start - 1} * (100% + 1px))"
		style:height="calc({item.end - item.start} * (100% + 1px))"
		style:z-index={index}
		style:background={item.is_overlapping ? 'red' : instanceColors.get(item.type)}
	>
		<Indicator color={item.colorIndicator} />
		{item.value.name}
		{item.value.instructor}
		{item.value.room}
	</div>
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
		height: calc(100% / 17);
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

	.item {
		display: grid;
		place-items: center;

		position: absolute;
		width: 100%;
		left: 0;
		padding: 6px;

		text-align: center;
		font-size: small;
		overflow: hidden;
		white-space: wrap;
		word-break: break-all;

		background: var(--primary);
		border-radius: 16px;
		box-shadow: 5px 5px 5px var(--shadow);
		&.preview {
			opacity: 50%;
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
</style>

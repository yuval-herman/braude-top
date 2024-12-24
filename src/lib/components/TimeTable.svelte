<script lang="ts">
	import { hoursList } from '$lib/utils';
	import type { Item } from '../types';

	const { items = [] }: { items?: Item[] } = $props();

	const itemsByDay = $derived(
		[...Array(6)].map((_, day) => items.filter((item) => item.day === day))
	);

	const dayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'long' });
	const hourFormatter = new Intl.DateTimeFormat('he-IL', {
		timeStyle: 'short'
	});
	const date = new Date(0);
	const getDay = (day: number) => (date.setDate(4 + day), dayFormatter.format(date));
	const getHour = (hour: number, min: number) => (
		date.setHours(hour, min), hourFormatter.format(date)
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
						<!-- svelte-ignore a11y_missing_attribute -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<a
							class="item"
							style:top="calc({item.start} * (100% + 1px) - 1px)"
							style:height="calc({item.end - item.start} * (100% + 1px) - 1px)"
							onclick={() => items.splice(items.indexOf(item), 1)}
						>
							{item.value}
						</a>
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
	}

	th,
	td {
		width: calc(100% / 8);
		height: calc(100% * (1 / 16 - 1));
		border: 1px solid #ccc;
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
		cursor: pointer;
		overflow: hidden;
		white-space: wrap;
		word-break: break-all;
	}
</style>

<script lang="ts">
	import type { Item } from '../types';

	const { items }: { items: Item[] } = $props();

	const itemsByDay = $derived(
		[...Array(7)].map((_, day) => items.filter((item) => item.day === day))
	);

	const hoursList = [
		{ hour: 8, min: 30 },
		{ hour: 9, min: 30 },
		{ hour: 10, min: 30 },
		{ hour: 11, min: 30 },
		{ hour: 12, min: 20 },
		{ hour: 12, min: 50 },
		{ hour: 13, min: 50 },
		{ hour: 14, min: 50 },
		{ hour: 15, min: 50 },
		{ hour: 16, min: 50 },
		{ hour: 17, min: 50 },
		{ hour: 18, min: 50 },
		{ hour: 19, min: 50 },
		{ hour: 20, min: 50 },
		{ hour: 21, min: 50 },
		{ hour: 22, min: 50 }
	];

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
							style:height="calc({item.end} * (100% + 1px) - 1px)"
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
				{#each { length: 7 } as _}
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
		background-color: #ccc;
		cursor: pointer;
	}
</style>

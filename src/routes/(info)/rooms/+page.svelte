<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getDay } from '$lib/utils/formatter.utils.js';

	const { data } = $props();

	type SortKey = (typeof columns)[number]['key'];
	let sortKey = $state<SortKey>('room');
	let sortOrder = $state(true);
	const arrow = $derived(sortOrder ? '🡓' : '🡑');

	const rooms = $derived(
		data.rooms.toSorted((a, b) => {
			const ord = compare(a[sortKey], b[sortKey]);
			if (sortKey === 'start_time') {
				if (ord === 0) return compare(a.end_time, b.end_time);
				return ord;
			} else if (sortKey === 'end_time') {
				if (ord === 0) return compare(a.start_time, b.start_time);
				return ord;
			} else {
				if (ord !== 0) return ord;
				const time = compare(a.start_time, b.start_time);
				if (time === 0) return compare(a.end_time, b.end_time);
				return time;
			}
		})
	);

	const columns = [
		{ key: 'room', label: 'חדר' },
		{ key: 'start_time', label: 'התחלה' },
		{ key: 'end_time', label: 'סוף' },
	] as const;

	const week_days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'] as const;

	function compare<T extends unknown>(a: T, b: T) {
		if (a === b) return 0;
		return (sortOrder ? a < b : a > b) ? -1 : 1;
	}
</script>

<svelte:head>
	<meta name="description" content="מציאת חדרים ריקים ללמידה במכללת בראודה." />
</svelte:head>

<header>
	<h1>חדרים פנויים</h1>
</header>
<main>
	<select
		name="day"
		id="day"
		onchange={({ currentTarget: { value } }) => {
			const url = new URL(page.url);
			url.searchParams.set('day', value);
			goto(url, { replaceState: true, state: page.state });
		}}
	>
		{#each week_days as day, i}
			<option value={day} selected={day === data.week_day}>{getDay(i)}</option>
		{/each}
	</select>
	<table>
		<thead>
			<tr>
				{#each columns as { key, label }}
					<th
						onclick={() => {
							if (sortKey === key) sortOrder = !sortOrder;
							else {
								sortOrder = true;
								sortKey = key;
							}
						}}
					>
						{label}
						<span>{sortKey === key ? arrow : '🡙'}</span>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rooms as room}
				<tr>
					<td>{room.room}</td>
					<td>{room.start_time}</td>
					<td>{room.end_time}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>

<style>
	main {
		padding: 1.5rem;
	}
	header {
		width: 100%;
		display: inline-block;
		background: var(--primary);
		border-radius: 12px;
		padding: 0 16px;
	}
	select {
		width: 100%;
		padding: 0.5rem;
		margin-bottom: 1rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	th,
	td {
		padding: 0.75rem;
		text-align: center;
		border: 1px solid var(--border);
	}

	th {
		cursor: pointer;
		background: var(--neutral);
		color: var(--text-header);
		font-weight: bold;
		position: sticky;
		top: 0;
	}

	td {
		background: var(bg);
	}

	tr:nth-child(odd) td {
		background: hsl(from var(--bg) h calc(s + 10) calc(l + 5));
	}
</style>

<script lang="ts">
	import type { CourseInstance, Session } from '$lib/types';
	interface Props {
		instance: CourseInstance;
		sessions: Session[];
	}
	const { instance, sessions }: Props = $props();
</script>

<div class="container">
	<div>
		<div class="data-cell">
			<span>שעות בשבוע:</span>
			<span>
				{instance.hours}
			</span>
		</div>
		{#if instance.is_full}
			<div class="data-cell">
				<span style="color: red;">הקבוצה מלאה</span>
			</div>
		{/if}
		<div class="data-cell">
			<span>שפת הקורס:</span>
			<span>{instance.language}</span>
		</div>
		<div class="data-cell">
			<span>מרצה:</span>
			<span>{instance.instructor}</span>
		</div>
	</div>
	<ul class="sessions">
		{#each sessions as session}
			<li class="data-cell">
				יום {session.week_day}, חדר {session.room}
				מ-{session.start_time}
				עד
				{session.end_time}
			</li>
		{/each}
	</ul>
</div>

<style>
	.container {
		border-radius: 8px;
		background-color: var(--top-bg);
		display: grid;
		grid-template-columns: 1fr 2fr;
		align-items: center;
	}
	.data-cell {
		background-color: aliceblue;
		border-radius: 8px;
		margin: 4px;
		padding: 2px 12px;
	}
	ul {
		list-style: none;
	}
</style>

<script lang="ts">
	import type { Course, CourseInstance, Session } from '$lib/types';
	interface Props {
		instance: CourseInstance;
		sessions: Session[];
	}
	const { instance, sessions }: Props = $props();
</script>

<div class="container">
	<div>
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
		<div class="data-cell slim">
			{#if instance.hours == 1}
				שעה בשבוע
			{:else if instance.hours < 1}
				<span style="color:red"> לא שמורות הרצאות במאגר </span>
			{:else}
				{instance.hours} שעות בשבוע
			{/if}
		</div>
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
		grid-template-columns: 40% 1fr;
		align-items: center;
	}
	.data-cell {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: wrap;
		background-color: aliceblue;
		border-radius: 8px;
		margin: 4px;
		padding: 2px 12px;
	}
	.slim {
		width: fit-content;
		margin: auto;
	}
	ul {
		padding: 0;
		list-style: none;
	}
</style>

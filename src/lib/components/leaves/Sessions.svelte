<script lang="ts">
	interface Props {
		sessions: CourseSession[];
	}
	const { sessions }: Props = $props();
</script>

<div class="sessions">
	{#each sessions as session}
		<div class="session">
			<span>יום {session.week_day}</span>
			<span>חדר {session.room}</span>
			<span>{session.start_time}-{session.end_time}</span>
		</div>
	{/each}
</div>

<style>
	.sessions {
		color: black;
		border-radius: 8px;
		border: dashed var(--border) 4px;
		overflow: hidden;
		.session {
			background: var(--contrast);
			&:not(:last-child) {
				border-bottom: var(--border) 2px solid;
			}
			padding: 4px;
		}
	}
</style>

<script lang="ts">
	import type { Course, CourseInstance, Session } from '$lib/types';
	interface Props {
		instance: CourseInstance;
		sessions: Session[];
		onclick: () => void;
	}
	const { instance, sessions, onclick }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="container" {onclick}>
	<div class="instance-details">
		<span>{instance.type}</span>
		<span>{instance.instructor}</span>
		<span>{instance.language}</span>
		{#if instance.is_full}
			<span style="color: red;">הקורס מלא!</span>
		{/if}
	</div>
	<div class="sessions">
		{#each sessions as session}
			<div class="session">
				<span>יום {session.week_day}</span>
				<span>חדר {session.room}</span>
				<span>{session.start_time}-{session.end_time}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		padding: 8px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
		align-items: center;
		border-radius: 8px;
		background-color: var(--top-bg);

		cursor: pointer;
		&:hover {
			background-color: color-mix(in srgb, var(--top-bg), white 20%);
		}
	}
	.sessions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.session {
		padding: 8px;
		background-color: var(--bg);
		border-radius: 4px;
	}
	span {
		display: block;
		text-align: center;
		white-space: wrap;
	}
</style>

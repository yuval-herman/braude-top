<script lang="ts">
	import type { FullCourse } from '$lib/types';
	interface Props {
		course: FullCourse;
		// onclick?: () => void;
	}
	const { course }: Props = $props();
	$inspect(course);
</script>

<div class="container">
	<h3>{course.name}</h3>
	<div class="instances">
		{#each course.instances as instance, i}
			<div class="instance" style="z-index: {course.instances.length - i};">
				<div class="instance-details">
					<span>{instance.type}</span>
					<span>של</span>
					<span>{instance.instructor}</span>
					<span>ב{instance.language}{instance.is_full ? ',' : ''}</span>
					{#if instance.is_full}
						<span class="warn">הקורס מלא!</span>
					{/if}
				</div>
				<div class="sessions">
					{#each instance.sessions as session}
						<div class="session">
							<span>יום {session.week_day}</span>
							<span>חדר {session.room}</span>
							<span>{session.start_time}-{session.end_time}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.warn {
		color: var(--warn);
	}
	h3 {
		margin: 0;
		margin-bottom: 12px;
	}
	.instances {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: 1fr;
		gap: 8px;
		@media (max-width: 500px) {
			grid-template-columns: repeat(2, 1fr);
		}
		@media (max-width: 350px) {
			grid-template-columns: 1fr;
		}
		* {
			min-width: 0px;
		}
		.instance {
			background: var(--primary);
			border-radius: 8px;
			padding: 8px;
			border: var(--border) 1px solid;
			box-shadow: 5px 5px 5px var(--shadow);
			cursor: pointer;
			&:hover {
				background: var(--primary-hover);
			}
			.instance-details {
				margin-bottom: 8px;
			}
			.sessions {
				border-radius: 8px;
				background: var(--bg-secondary);
				overflow: hidden;
				.session {
					&:nth-child(odd) {
						background: color-mix(in srgb, var(--bg-secondary), black 5%);
					}
					&:not(:last-child) {
						border-bottom: var(--border) 2px solid;
					}
					padding: 4px;
				}
			}
		}
	}
</style>

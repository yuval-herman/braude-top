<script lang="ts">
	import {
		addSelectedCourse,
		removeSelectedCourse,
		selectedCourses,
		hoveredInstance
	} from '$lib/state.svelte';
	import type { CourseInstance, FullCourse } from '$lib/types';
	import { itemizeCourse } from '$lib/utils';

	interface Props {
		course: FullCourse;
		mode?: 'all' | 'my';
	}
	const { course, mode = 'all' }: Props = $props();
	function instanceInSelected(instance: CourseInstance) {
		return selectedCourses.some((c) =>
			c.instances.some((i) => i.course_instance_id === instance.course_instance_id)
		);
	}

	// warn when the course registration is incomplete
	const warn = $derived.by(
		() =>
			mode === 'my' &&
			!course.instances.every(
				(i) =>
					!i.co_requirements ||
					(JSON.parse(i.co_requirements) as number[]).some((req) =>
						selectedCourses.find((c) => c.instances.find((i) => i.course_instance_id === req))
					)
			)
	);
</script>

<div class="container" class:warn>
	<h3>{course.name}</h3>
	<div class="instances">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		{#each course.instances as instance, i}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="instance"
				style="z-index: {course.instances.length - i};"
				onclick={() =>
					instanceInSelected(instance)
						? removeSelectedCourse({ ...course, instances: [instance] })
						: addSelectedCourse({ ...course, instances: [instance] })}
				onmouseenter={() =>
					(hoveredInstance.items = itemizeCourse({ ...course, instances: [instance] }))}
				onmouseleave={() => (hoveredInstance.items.length = 0)}
			>
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
	{#if warn}
		<div class="info">
			<h4 class="warn">הרישום לקורס אינו שלם!</h4>
			<span>כדי להשלים את הרישום לקורס עליך להירשם גם לאחד מקורסי התרגול</span>
		</div>
	{/if}
</div>

<style>
	.warn:is(span, h4) {
		color: var(--warn);
	}
	.info {
		color: var(--text-secondary);
		font-style: italic;
		margin: 4px;
	}
	div.warn {
		border: double 6px var(--warn);
	}
	h3,
	h4 {
		margin: 0;
		margin-bottom: 12px;
	}
	.container {
		container-type: inline-size;
		border-radius: 8px;
		padding: 4px;
	}
	.instances {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: 1fr;
		gap: 8px;
		@container (max-width: 450px) {
			grid-template-columns: repeat(2, 1fr);
		}
		@container (max-width: 350px) {
			grid-template-columns: 1fr;
		}
		* {
			min-width: 0px;
		}
		.instance {
			background: var(--info);
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
				border: dashed var(--border) 4px;
				overflow: hidden;
				.session {
					background: var(--secondary);
					&:nth-child(odd) {
						background: var(--secondary-hover);
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

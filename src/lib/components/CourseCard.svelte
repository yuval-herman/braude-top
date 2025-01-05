<script lang="ts">
	import Indicator from './Indicator.svelte';

	import {
		addSelectedCourse,
		hoveredInstance,
		removeSelectedCourse,
		selectedCourses
	} from '$lib/state.svelte';
	import { css, instanceColors, itemizeCourse } from '$lib/utils';
	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';

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
	function getColor(instance: CourseInstance, hover = false) {
		let color = instanceColors.get(instance.type) ?? (instanceColors.get('default') as string);
		if (
			mode === 'all' &&
			selectedCourses.find((c) =>
				c.instances.find((i) => i.course_instance_id === instance.course_instance_id)
			)
		) {
			color = css.colors.saturate(color, -25);
		}
		return hover ? css.colors.lighten(color) : color;
	}
</script>

<div class="container" class:warn>
	<h3>{course.name}</h3>
	<div class="instances">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		{#each course.instances as instance, i (instance.course_instance_id)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="instance"
				style="z-index: {course.instances.length - i};"
				style:--instance-background={getColor(instance)}
				style:--instance-background-hover={getColor(instance, true)}
				onclick={() =>
					instanceInSelected(instance)
						? removeSelectedCourse({ ...course, instances: [instance] })
						: addSelectedCourse({ ...course, instances: [instance] })}
				onmouseenter={mode === 'all'
					? () => (hoveredInstance.items = itemizeCourse({ ...course, instances: [instance] }))
					: undefined}
				onmouseleave={mode === 'all' ? () => (hoveredInstance.items.length = 0) : undefined}
				transition:slide
				animate:flip={{ duration: 250, delay: 50 }}
			>
				{#if mode === 'my'}
					<Indicator color={css.colors.str2color(course.name)} />
				{/if}
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
		{#if mode === 'my' && course.instances.some((i) => i.exams.length > 0)}
			<div class="exams">
				{#each course.instances as { exams, course_instance_id } (course_instance_id)}
					{#each exams as exam (exam.date)}
						<p transition:slide|global>
							<span>{exam.exam_type},</span>
							<span>מועד {exam.exam_round},</span>
							<span>ב-{exam.date}</span>
						</p>
					{/each}
				{/each}
			</div>
		{/if}
	</div>
	{#if warn}
		<div class="info" transition:fade>
			<h4 class="warn">הרישום לקורס אינו שלם!</h4>
			<span>כדי להשלים את הרישום לקורס עליך להירשם גם לאחד מקורסי התרגול</span>
		</div>
	{/if}
</div>

<style>
	.warn:is(span, h4) {
		color: var(--warn);
		font-weight: bolder;
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
		transition: border 250ms;
		container-type: inline-size;
		border-radius: 8px;
		padding: 12px;
		background: var(--bg);
	}
	.instances {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		@container (max-width: 450px) {
			grid-template-columns: repeat(2, 1fr);
		}
		@container (max-width: 350px) {
			grid-template-columns: 1fr;
		}
		* {
			min-width: 0px;
		}
		.exams {
			background: var(--info);
		}
		.instance,
		.exams {
			margin: 4px;
			border-radius: 8px;
			padding: 8px;
			box-shadow: 5px 5px 5px var(--shadow);
			p {
				margin: 4px;
				&:not(:last-child) {
					padding-bottom: 4px;
					border-bottom: var(--border) 2px solid;
				}
			}
		}
		.instance {
			position: relative;
			background: var(--instance-background);
			border: var(--border) 1px solid;
			cursor: pointer;
			transition: all 0.25s;
			&:hover {
				background: var(--instance-background-hover);
			}
			.instance-details {
				margin-bottom: 8px;
			}
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
		}
	}
</style>

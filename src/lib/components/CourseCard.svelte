<script lang="ts">
	import {
		addSelectedCourse,
		hoveredInstance,
		removeSelectedCourse,
		selectedCourses,
	} from '$lib/state.svelte';
	import { css, instanceColors, itemizeCourse, listFormatter } from '$lib/utils';
	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';
	import Indicator from './Indicator.svelte';
	import { page } from '$app/state';

	interface Props {
		course: FullCourse;
		mode?: 'all' | 'my';
	}

	const { course, mode = 'all' }: Props = $props();

	// warn when the course registration is incomplete
	const warn = $derived(registrationIncomplete(mode, course));

	function registrationIncomplete(mode: 'all' | 'my', course: FullCourse): boolean {
		if (mode === 'all') return false;
		return !course.instances.every(
			(i) =>
				!i.co_requirements ||
				(JSON.parse(i.co_requirements) as number[]).some((req) =>
					selectedCourses.find((c) => c.instances.find((i) => i.course_instance_id === req))
				)
		);
	}

	function instanceInSelected(instance: CourseInstance) {
		return selectedCourses.some((c) =>
			c.instances.some((i) => i.course_instance_id === instance.course_instance_id)
		);
	}

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
	<header>
		<h3>{course.name}</h3>
		<a aria-label="מידע נוסף" href="course/{course.course_id}">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 32 32"
				fill="currentColor"
				><path
					d="m17.962 24.725 1.806.096v2.531h-7.534v-2.406l1.045-.094c.568-.063.916-.254.916-1.014v-8.801c0-.699-.188-.92-.791-.92l-1.106-.062v-2.626h5.666zM15.747 4.648c1.394 0 2.405 1.047 2.405 2.374 0 1.331-1.014 2.313-2.438 2.313-1.454 0-2.404-.982-2.404-2.313 0-1.327.95-2.374 2.437-2.374M16 32C7.178 32 0 24.822 0 16S7.178 0 16 0c8.82 0 16 7.178 16 16s-7.18 16-16 16m0-29C8.832 3 3 8.832 3 16s5.832 13 13 13 13-5.832 13-13S23.168 3 16 3"
				/></svg
			></a
		>
	</header>

	<div class="instances">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		{#each course.instances as instance, i (instance.course_instance_id)}
			{@const background = css.colors.num2color(course.course_id)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="instance"
				style="z-index: {course.instances.length - i};"
				style:--instance-background={background}
				style:--instance-background-hover={getColor(instance, true)}
				style:color={css.a11y.getContrast({
					background,
					light: 'var(--text-light)',
					dark: 'var(--text-dark)',
				})}
				onclick={() =>
					instanceInSelected(instance)
						? removeSelectedCourse(
								{ ...course, instances: [instance] },
								page.data.year,
								page.data.semester
							)
						: addSelectedCourse(
								{ ...course, instances: [instance] },
								page.data.year,
								page.data.semester
							)}
				onmouseenter={mode === 'all'
					? () => (hoveredInstance.items = itemizeCourse({ ...course, instances: [instance] }))
					: undefined}
				onmouseleave={mode === 'all' ? () => (hoveredInstance.items.length = 0) : undefined}
				transition:slide
				animate:flip={{ duration: 250, delay: 50 }}
			>
				<Indicator color={getColor(instance)} />
				<div class="instance-details">
					<span>{instance.type}</span>
					<span>של</span>
					<span>{instance.instructor}</span>
					<span>ב{instance.language}{instance.is_full ? ',' : ''}</span>
					{#if instance.is_full}
						<span class="warn">הקורס מלא!</span>
					{/if}
				</div>
				{#if instance.faculty.length}
					<div class="instance-details important">
						<span>מיועד ל{listFormatter.format(instance.faculty)} </span>
					</div>
				{/if}

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
							{#if exam.exam_type === 'ללא בחינה - עבודה, פרוייקט,דוח'}
								<span>{exam.exam_type} להגשה</span>
							{:else}
								<span
									>מועד {exam.exam_round === 1
										? 'ראשון'
										: exam.exam_round === 2
											? 'שני'
											: exam.exam_round},</span
								>
								{#if !exam.exam_type}
									<span>בחינה,</span>
								{:else if ['בחינה רגילה', 'בחינה במעבדה', 'בחינה מפוצלת', 'מבחן בית'].includes(exam.exam_type)}
									<span>{exam.exam_type},</span>
								{:else if exam.exam_type === 'ללא השגחה'}
									<span>בחינה ללא השגחה</span>
								{/if}
							{/if}
							<span>בתאריך {exam.date}</span>
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
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
		h3 {
			margin: 0;
		}
		a {
			outline: none;
			color: var(--text-secondary);
		}
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
			padding-right: 12px;
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
				&.important {
					color: white;
					background: var(--dark);
					border-radius: 8px;
					padding: 4px 6px;
				}
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

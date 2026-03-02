<script lang="ts">
	import {
		addCourse,
		addCourseActivateInstance,
		getActiveExams,
		getActiveInstances,
		hasCourse,
		isInstanceActive,
		removeCourse,
		toggleInstance,
	} from '$lib/courseManager.svelte';
	import { hoveredInstanceId, hoveredItems } from '$lib/state.svelte';
	import { instanceColors, type Institute } from '$lib/utils/constants.utils';
	import { getContrast, num2color } from '$lib/utils/css.utils';
	import { itemizeCourse } from '$lib/utils/item.utils';
	import parseColor from 'color-parse';
	import space from 'color-space';
	import { fade, slide } from 'svelte/transition';
	import Indicator from './Indicator.svelte';
	import Sessions from './leaves/Sessions.svelte';

	interface Props {
		course: SemesterCourse;
		mode?: 'all' | 'my';
		institute: Institute;
		hoursList: Time[];
	}

	const { course, mode = 'all', institute, hoursList }: Props = $props();

	// warn when the course registration is incomplete
	const warn = $derived(registrationIncomplete(mode, course));

	function registrationIncomplete(
		mode: 'all' | 'my',
		course: Pick<Course, 'course_id' | 'year'>
	): undefined | CourseInstance['co_requirement_instance_ids'] {
		if (mode === 'all') return;
		const selected_from_course = getActiveInstances(course);
		inst_loop: for (const instance of selected_from_course) {
			if (!instance.co_requirement_instance_ids) continue;
			const co_requirements = instance.co_requirement_instance_ids;
			for (const req_id of co_requirements) {
				if (selected_from_course.some((s) => s.instance_id === req_id)) continue inst_loop;
			}
			return co_requirements;
		}
	}

	function getColor(instance: StrippedCourseInstance) {
		let background = num2color(course.course_id);
		if (isInstanceActive(instance)) {
			const rgb = parseColor(background).values;
			rgb.length = 3; // truncate alpha if exists
			const [hue, sat, light] = space.rgb.hsl(rgb as [number, number, number]);
			background = `hsl(${hue}, ${sat + 20}%, ${light / 2}%)`;
		}
		const indicator =
			instanceColors.get(instance.type) ?? (instanceColors.get('default') as string);
		return {
			hover: indicator,
			indicator,
			background,
		};
	}
</script>

<div class="container" class:warn>
	<header>
		<div>
			<h3>{course.name}</h3>
			<span class="info">{course.course_id}</span>
		</div>
		<a aria-label="מידע נוסף" class="icon-info-circled" href="{institute}/course/{course.course_id}"
		></a>
	</header>
	{#if hasCourse(course)}
		<button class="remove-button" onclick={() => removeCourse(institute, course)}
			>מחק קורס מהרשימה</button
		>
	{:else}
		<button class="add-button" onclick={() => addCourse(institute, course, course.instances)}
			>הוסף קורס לרשימה</button
		>
	{/if}
	<div class="instances">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		{#each course.instances as instance, i (instance.instance_id)}
			{@const c = getColor(instance)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="instance"
				class:warn={warn?.includes(instance.instance_id)}
				class:highlight={hoveredInstanceId.id === instance.instance_id}
				style="z-index: {course.instances.length - i};"
				style:--instance-background={c.background}
				style:--instance-background-hover={c.hover}
				style:color={getContrast({
					background: c.background,
					light: 'var(--text-light)',
					dark: 'var(--text-dark)',
				})}
				onclick={() => {
					hasCourse(course)
						? toggleInstance(institute, instance.instance_id)
						: addCourseActivateInstance(institute, course, course.instances, instance.instance_id);
				}}
				onmouseenter={() => {
					hoveredItems.items = itemizeCourse(
						institute,
						hoursList,
						{ ...course, instances: [instance] },
						true
					);
				}}
				onmouseleave={() => (hoveredItems.items = undefined)}
			>
				<Indicator color={c.indicator} />
				<div class="instance-details">
					<span>{instance.type}</span>
					<span>של</span>
					<span>{instance.instructor}</span>
					{#if instance.language}
						<span>ב{instance.language}</span>
					{/if}
					<!-- {#if instance.is_full}
						<span class="warn">הקורס מלא!</span>
					{/if} -->
				</div>
				<!--				{#if instance.faculty.length}
					<div class="instance-details important">
						<span>מיועד ל{listFormatter.format(instance.faculty)} </span>
					</div>
				{/if} -->
				<Sessions sessions={instance.sessions} />
			</div>
		{/each}
		{#if mode === 'my'}
			{@const exams = getActiveExams(course)}
			{#if exams.length}
				<div class="exams" transition:slide>
					{#each exams as exam}
						<p transition:slide>
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
				</div>
			{/if}
		{/if}
	</div>
	{#if warn}
		<div class="info" transition:fade>
			<h4 class="warn">הרישום לקורס אינו שלם!</h4>
			<span>כדי להשלים את הרישום לקורס עליך להירשם גם לאחד מהקורסים המודגשים</span>
		</div>
	{/if}
</div>

<style>
	.warn:is(h4) {
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
		display: flex;
		flex-direction: column;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		h3 {
			margin: 0;
		}
		a {
			text-decoration: none;
			color: var(--text-secondary);
			font-size: 1.5em;
		}
	}
	.add-button,
	.remove-button {
		margin: 0 4px;
		border-radius: 4px;
		border: none;
	}
	.add-button {
		background: var(--success);
		color: var(--text-light);
	}
	.remove-button {
		background: var(--primary);
		color: var(--text-light);
	}
	.highlight {
		box-shadow: 0 0 15px yellow !important;
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
			overflow: hidden;

			&:hover {
				background: var(--instance-background-hover);
			}
			&.warn {
				border: solid 4px var(--warn);
			}
			.instance-details {
				margin-bottom: 8px;
			}
		}
	}
</style>

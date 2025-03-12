<script lang="ts">
	import { slide } from 'svelte/transition';
	import CourseCard from './CourseCard.svelte';

	interface Props {
		mode?: 'all' | 'my';
		items: FullCourse[];
	}
	const { items, mode = 'all' }: Props = $props();
</script>

<div class="container">
	<ul>
		{#each items as course (course.course_id + course.year)}
			<li transition:slide>
				<CourseCard {course} {mode} />
			</li>
		{/each}
	</ul>
</div>

<style>
	.container {
		max-height: 100%;
		max-width: 100%;
		overflow: hidden;
		display: flex;
		gap: 8px;
		flex-direction: column;
		ul {
			flex-grow: 1;
			list-style-type: none;
			margin: 0;
			border-radius: 8px;
			overflow: hidden scroll;
			scrollbar-width: none; /* TODO: make a manual scrollbar, chrome's scrollbar looks awful and safari does not support styling... */
			margin: 8px;
			padding: 0;
			li {
				margin-bottom: calc(32px);
				box-shadow: 5px 5px 5px var(--shadow);
				border-radius: 8px;
			}
		}
	}
</style>

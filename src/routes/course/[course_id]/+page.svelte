<script lang="ts">
	const { data } = $props();
	const { course } = data;
	if (course === undefined) {
		throw new Error('Course not found');
	}
</script>

{#snippet YedionButton(course_id: number)}
	<form action="https://info.braude.ac.il/yedion/fireflyweb.aspx" method="POST" target="_blank">
		<input type="hidden" name="PRGNAME" value="S_LOOK_FOR_NOSE" />
		<input type="hidden" name="ARGUMENTS" value="-N{course_id}" />
		<button type="submit">פתח את דף הקורס בתחנת המידע</button>
	</form>
{/snippet}

<div class="container">
	<div class="content">
		<header>
			<h1>
				{course.name}
			</h1>
			<h4>
				{course.year}
			</h4>
		</header>
		<main>
			<div class="flex-info">
				<a href={course.syllabus_link} target="_blank" rel="noopener noreferrer">סילבוס הקורס</a>
				<span
					><b>נ"זים:</b>
					{course.credit}
				</span>
				<span
					><b>נ"זים:</b>
					{course.credit}
				</span>
				{@render YedionButton(course.course_id)}
			</div>
			<section class="description">
				{#each course.description.split('\n') as paragraph}
					<p>{paragraph}</p>
				{/each}
			</section>
		</main>
	</div>
</div>

<style>
	form {
		display: inline;
	}
	button {
		border: none;
		background: var(--light);
		color: var(--dark);
		border-radius: 8px;
		padding: 0.5em;
		font-size: medium;
		&:hover {
			background: hsl(from var(--light) h s calc(l + 5));
		}
	}
	.container {
		width: 100%;
		height: 100%;
		display: flex;
	}
	.content {
		flex-grow: 1;
		border-radius: 12px;
		margin: 1rem;
		background: var(--bg);
		main {
			padding: 1rem;
			display: grid;
			gap: 8px;
		}
		.flex-info {
			display: flex;
			align-items: center;
			gap: 1em;
		}
		.flex-info,
		.description {
			background: var(--neutral);
			padding: 12px;
			border-radius: 8px;
		}
		p {
			margin: 4px;
		}
		header {
			background: var(--primary);
			border-radius: 12px;
			padding: 0 16px;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
	}
</style>

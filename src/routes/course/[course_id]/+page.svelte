<script lang="ts">
	import { listFormatter } from '$lib/utils.js';

	const { data } = $props();
	const { course } = data;
	if (course === undefined) {
		throw new Error('Course not found');
	}

	const properties = $derived.by(() => {
		const languages = new Set<string>();
		const types = new Set<string>();
		const notes: { id: number; note: string }[] = [];
		let fullInstances = new Map<string, number>();

		for (const instance of course.instances) {
			if (instance.language) languages.add(instance.language);
			if (instance.is_full)
				fullInstances.set(instance.type, (fullInstances.get(instance.type) ?? 0) + 1);
			if (instance.extra_notes)
				notes.push({ note: instance.extra_notes, id: instance.course_instance_id });

			types.add(instance.type);
		}

		return { languages, types, fullInstances, notes };
	});

	function joinSet(set: Set<string>) {
		return listFormatter.format(set) + (set.size === 1 ? ' בלבד' : '');
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
			{#if properties.languages.size > 0}
				<span>הקורס זמין ב{joinSet(properties.languages)} </span>
			{/if}
			{@render YedionButton(course.course_id)}
		</div>
		<div class="list-info">
			<ul>
				<li>
					<span>לקורס שיעורים מסוג {joinSet(properties.types)} </span>
				</li>
				{#if properties.fullInstances.size > 0}
					<li>
						כמויות השיעורים שכבר התמלאו הן:
						<table>
							<tbody>
								{#each properties.fullInstances as [type, amount]}
									<tr><th>{type}:</th><td> {amount}</td></tr>
								{/each}
							</tbody>
						</table>
					</li>
				{/if}
				{#if properties.notes.length > 0}
					<li>
						<details>
							<summary
								>ישנן הערות על חלק מהקבוצות בקורס, מומלץ לקרוא את ההערות על מנת לוודא שאתם באמת
								יכולים להירשם לקורס.
								<i class="info">כדי לוודא ניתן להיכנס לדף הקורס בתחנת המידע מהקישור למעלה</i>
							</summary>
							<ul>
								{#each properties.notes as note}
									<li>
										<span class="info">מספר זיהוי {note.id}</span>
										<p>
											{note.note}
										</p>
									</li>
								{/each}
							</ul>
						</details>
					</li>
				{/if}
			</ul>
		</div>
		<div class="description">
			{#each course.description.split('\n') as paragraph}
				<p>{paragraph}</p>
			{/each}
		</div>
		<div class="tension">כאן יופיעו תגובות ודירוגים של סטודנטים, ממוצעי מבחנים ועוד!</div>
	</main>
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
	details summary {
		cursor: pointer;
	}
	.info {
		color: var(--text-secondary);
	}
	.tension {
		margin: auto;
		padding: 40px;
		color: var(--info);
	}
	.container {
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
		.list-info,
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

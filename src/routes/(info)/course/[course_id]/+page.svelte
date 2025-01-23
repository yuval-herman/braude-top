<script lang="ts">
	import { settings } from '$lib/settings.svelte.js';
	import { listFormatter } from '$lib/utils/formatter.utils.js';

	const { data } = $props();
	const { course, comments, user, user_previous_comment } = data;

	let anonymous = $state(user_previous_comment?.is_anon ?? $settings.anonymous_comment);

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

	function dateToString(date: Date) {
		date.setHours(date.getHours() + 2);
		return date.toLocaleString();
	}
</script>

<svelte:head>
	<meta
		name="description"
		content="מידע על קורס {course.name} במכללת בראודה. ניתן לצפות בנקודות הזכות של הקורס, שפות בהן הוא מועבר ותיאור כללי."
	/>
</svelte:head>

{#snippet YedionButton(course_id: number)}
	<form
		style="display: inline;"
		id="yedion"
		action="https://info.braude.ac.il/yedion/fireflyweb.aspx"
		method="POST"
		target="_blank"
	>
		<input type="hidden" name="PRGNAME" value="S_LOOK_FOR_NOSE" />
		<input type="hidden" name="ARGUMENTS" value="-N{course_id}" />
		<button type="submit">פתח את דף הקורס בתחנת המידע</button>
	</form>
{/snippet}

<header class="course-header">
	<h1>
		{course.name}
	</h1>
	<h4>
		{course.year}
	</h4>
</header>
<main>
	<div class="flex-info">
		<a id="syllabus" href={course.syllabus_link} target="_blank" rel="noopener noreferrer"
			>סילבוס הקורס</a
		>
		<span id="points"
			><b>נ"זים:</b>
			{course.credit}
		</span>
		{#if properties.languages.size > 0}
			<span id="languages">הקורס זמין ב{joinSet(properties.languages)} </span>
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
		</ul>
	</div>
	<div class="description" id="description">
		{#each course.description.split('\n') as paragraph}
			<p>{paragraph}</p>
		{/each}
	</div>
	<div class="comments">
		<h3>תגובות</h3>
		{#if user}
			<form action="?/add-comment" method="post">
				<div class="rating">
					<span>דירוג:</span>
					<div class="stars">
						{#each { length: 5 }, i}
							<input
								type="radio"
								id="star{5 - i}"
								name="stars"
								value={5 - i}
								checked={user_previous_comment?.rating === 5 - i}
							/>
							<label for="star{5 - i}" class="icon-star"></label>
						{/each}
					</div>
				</div>
				<label>
					{anonymous ? 'הישאר אנונימי' : 'מגיב כ-' + user.name}
					<input type="checkbox" name="anonymous" id="anonymous" bind:checked={anonymous} />
				</label>
				<label
					>תגובה:
					<textarea name="content" rows="3" placeholder="תגובתך כאן..." required
						>{user_previous_comment?.content}</textarea
					>
				</label>
				<button type="submit"
					>{#if user_previous_comment}עדכן תגובה{:else}שלח תגובה{/if}</button
				>
			</form>
		{:else}
			<p class="info">כדי להגיב או לדרג חובה להתחבר</p>
		{/if}
		{#if comments.length}
			<ol>
				{#each comments as comment (comment.id)}
					<li>
						<article>
							<header>
								<span>תאריך: {dateToString(new Date(comment.created_at))}</span>
								{#if comment.updated_at}<span
										>עודכן בתאריך: {dateToString(new Date(comment.updated_at))}</span
									>{/if}
								{#if comment.rating}<span>דירוג: {comment.rating}</span>{/if}
								<span>מגיב: {comment.poster_name ?? 'אנונימי'}</span>
							</header>
							<p>{comment.content}</p>
						</article>
					</li>
				{/each}
			</ol>
		{:else}
			<span>אין תגובות...</span>
		{/if}
	</div>
</main>

<style>
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

	.info {
		color: var(--text-secondary);
		font-style: italic;
	}

	.course-header {
		background: var(--primary);
		border-radius: 12px;
		padding: 0 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	main {
		padding: 1rem;
		display: grid;
		gap: 8px;

		& > div {
			background: var(--neutral);
			padding: 12px;
			border-radius: 8px;
		}
	}
	.comments {
		h3 {
			margin: 0;
			margin-bottom: 1rem;
		}
		form {
			.rating {
				label {
					cursor: pointer;
				}
				.stars {
					display: inline;
					direction: ltr;
					text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
					input[type='radio'] {
						display: none;
						&:checked ~ label {
							color: gold;
						}
					}
				}
			}

			textarea {
				width: 100%;
				padding: 12px 20px;
				font-family: inherit;
				border: 1px solid var(--border);
				border-radius: 4px;
				resize: none;
			}

			button[type='submit'] {
				background-color: var(--success);
				color: white;
				padding: 14px 20px;
				margin: 8px 0;
				border: none;
				border-radius: 4px;
				cursor: pointer;

				@media (max-width: 450px) {
					width: 100%;
				}
			}
		}
		article {
			background: var(--info);
			border-radius: 4px;
			padding: 4px;
			margin: 4px;
			p {
				padding-right: 8px;
			}
		}
	}
	.flex-info {
		display: flex;
		align-items: center;
		gap: 1em;
	}
	p {
		margin: 4px;
	}
</style>

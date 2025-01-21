<script>
	import { settings } from '$lib/settings.svelte';
</script>

<header>
	<h1>הגדרות</h1>
</header>
<main>
	<section class="setting">
		<h3>רווח בין עמודות</h3>
		<div class="setting-item">
			<label for="columns_margins" class="setting-label"
				>האם להציג רווח בין עמודות במערכת השעות?</label
			>
			<input
				type="checkbox"
				name="columns_margins"
				id="columns_margins"
				checked={$settings.columns_margins}
				onchange={({ currentTarget }) => {
					$settings.columns_margins = currentTarget.checked;
				}}
			/>
		</div>
	</section>
	<section class="setting">
		<h3>הפסקת צהריים</h3>
		<div class="setting-item">
			<label for="show_lunch" class="setting-label"
				>האם להציג את הפסקת הצהריים כשורה בפני עצמה במערכת השעות?</label
			>
			<input
				type="checkbox"
				name="show_lunch"
				id="show_lunch"
				checked={$settings.show_lunch}
				onchange={({ currentTarget }) => {
					$settings.show_lunch = currentTarget.checked;
				}}
			/>
		</div>
	</section>
	<section class="setting">
		<h3>זמני הליכה</h3>
		<div class="setting-item">
			<label for="show_walk_times" class="setting-label"
				>האם להציג זמני הליכה והפסקות בין שיעורים במערכת השעות?</label
			>
			<input
				type="checkbox"
				name="show_walk_times"
				id="show_walk_times"
				checked={$settings.show_walk_times}
				onchange={({ currentTarget }) => {
					$settings.show_walk_times = currentTarget.checked;
				}}
			/>
		</div>
	</section>
	<section class="setting">
		<h3>תגובות אנונימיות</h3>
		<div class="setting-item">
			<label for="anonymous_comment" class="setting-label"
				>האם לבחור אוטומטית בהגבה אנונימית על קורסים?</label
			>
			<input
				type="checkbox"
				name="anonymous_comment"
				id="anonymous_comment"
				checked={$settings.anonymous_comment}
				onchange={({ currentTarget }) => {
					$settings.anonymous_comment = currentTarget.checked;
				}}
			/>
		</div>
	</section>
</main>

<style>
	header {
		background: var(--primary);
		border-radius: 12px;
		padding: 0 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	main {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		padding: 1.5rem;
		.setting {
			flex-grow: 1;
			background: var(--neutral);
			padding: 1rem;
			border-radius: 8px;
			h3 {
				margin: 0 0 0.5rem;
				color: var(--text-primary);
			}
			.setting-item {
				display: flex;
				justify-content: space-between;
				gap: 4px;

				.setting-label {
					color: var(--text-secondary);
					padding: 4px 8px;
					margin-right: 1rem;
				}
				input[type='checkbox'] {
					transform: scale(1.2);
				}
			}
		}
	}
</style>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';

	const { form } = $props();
</script>

<svelte:head>
	<meta
		name="description"
		content="יצירת קשר עם מפתח האתר. ניתן להשאיר מייל על מנת שנוכל לחזור אליך."
	/>
</svelte:head>

<header>
	<h1>דיווח ובקשות</h1>
</header>
<main>
	<h4>כאן ניתן ליצור איתי קשר על מנת לדווח על באגים או לבקש פיצ'רים</h4>

	{#if form?.success}
		<span transition:slide class="success">הבקשה נשלחה בהצלחה!</span>
	{:else if form?.success === false}
		<span transition:slide class="failure">הבקשה לא התקבלה בעקבות תקלה...</span>
	{/if}

	<form
		action="?/contact"
		method="post"
		use:enhance={({ formData, cancel }) => {
			if (
				!formData.get('email') &&
				!confirm(
					'אתה עומד לשלוח לי הודעה אנונימית לחלוטין.\n' +
						"זה בסדר ואני מכבד את הפרטיות של כולם, אבל המשמעות היא שאני לא אוכל ליצור איתך קשר אם לא הבנתי מה אתה מבקש או כדי להודיע לך שהכנתי את הפיצ'ר שביקשת וכו'...\n\n" +
						'להמשיך בשליחת ההודעה האנונימית?'
				)
			)
				cancel();

			window.goatcounter.count({
				event: true,
				path: 'sent-contact-message',
				title: 'User sent a message',
			});
		}}
	>
		<label
			>שם (לא חובה):
			<input type="text" name="name" placeholder="הזן את שמך" />
		</label>

		<label for="email">אימייל (לא חובה):</label>
		<input type="email" name="email" placeholder="example@domain.com" />

		<label
			>סוג הבקשה:
			<select name="type" required>
				<option value="bug">דיווח על באג</option>
				<option value="feature">בקשת פיצ'ר</option>
				<option value="other">אחר</option>
			</select>
		</label>

		<label
			>הודעה:
			<textarea name="message" rows="4" placeholder="פרט את הבקשה שלך כאן" required></textarea>
		</label>

		<input type="submit" value="שלח!" />
	</form>
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
		padding: 1rem;
		display: grid;
		gap: 8px;
		.success,
		.failure {
			padding: 8px;
			border-radius: 8px;
		}
		.failure {
			background: var(--warn);
		}
		.success {
			background: var(--success);
		}
		form {
			input,
			select {
				width: 100%;
				padding: 12px 20px;
				margin: 8px 0;
				display: inline-block;
				border: 1px solid var(--border);
				border-radius: 4px;
				box-sizing: border-box;
			}

			input[type='submit'] {
				width: 100%;
				background-color: var(--success);
				color: white;
				padding: 14px 20px;
				margin: 8px 0;
				border: none;
				border-radius: 4px;
				cursor: pointer;
			}

			textarea {
				width: 100%;
				height: 150px;
				padding: 12px 20px;
				font-family: inherit;
				border: 1px solid var(--border);
				border-radius: 4px;
				resize: none;
			}
		}
	}
</style>

<div class="container">
	<header>
		<h1>דיווח ובקשות</h1>
	</header>
	<main>
		<h4>כאן ניתן ליצור איתי קשר על מנת לדווח על באגים או לבקש פיצ'רים</h4>
		<form action="?/contact" method="post">
			<label
				>שם:
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
</div>

<style>
	.container {
		flex-grow: 1;
		border-radius: 12px;
		margin: 1rem;
		background: var(--bg);
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
	}
</style>

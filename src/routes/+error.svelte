<script lang="ts">
	import { page } from '$app/state';
</script>

<main>
	<h1>שגיאה!</h1>
	<h2>{page.error?.message}</h2>
	<h3>{page.status}</h3>
	{#if page.status === 404}
		<h4>דף לא נמצא</h4>
		<p>
			נראה שהגעת לדף שאינו קיים, <a href="/">חזרה לדף הראשי</a>
		</p>
	{:else}
		<p>
			קרתה שגיאה, נסה לרענן את הדף, אם זה לא עוזר ניתן ליצור קשר <a href="/contact">בדף הקשר</a>,
			<a href="/">חזרה לדף הראשי</a>
		</p>
	{/if}
</main>

<style>
	main {
		margin: auto;
		text-align: center;
	}
</style>

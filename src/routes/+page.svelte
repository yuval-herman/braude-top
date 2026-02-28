<script lang="ts">
	import '$lib/global.css';
	import { theme } from '$lib/state.svelte';
	import { INSTITUTES } from '$lib/utils/constants.utils';
</script>

<svelte:head>
	<meta name="color-scheme" content={theme.theme === 'auto' ? 'light dark' : theme.theme} />
</svelte:head>

<div class="container institute-select">
	<h1>בחירת מוסד</h1>
	<p>אנא בחר את המוסד שלך מהרשימה:</p>
	<ul>
		{#each [...INSTITUTES].sort() as inst}
			<li><a href={'/' + inst}>{inst}</a></li>
		{/each}
	</ul>
</div>

<style>
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.institute-select {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;

		h1 {
			margin-bottom: 1rem;
		}

		ul {
			list-style: none;
			padding: 0;
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
			gap: 1rem;
			width: 100%;
			max-width: 600px;
		}

		a {
			display: block;
			text-align: center;
			text-transform: capitalize;
			padding: 0.75rem 1rem;
			background: var(--bg);
			color: var(--text);
			border-radius: 8px;
			text-decoration: none;
			font-weight: bold;

			&:hover {
				background: var(--accent);
			}
		}
	}
</style>

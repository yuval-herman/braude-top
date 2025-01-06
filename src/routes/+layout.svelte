<script>
	import '$lib/global.css';
	// import { theme } from '$lib/state.svelte'; TODO

	let { children } = $props();
</script>

<div class="container">
	<nav>
		<ul>
			<li><a href="/">ראשי</a></li>
		</ul>
	</nav>
	<!-- <button
	onclick={() => (theme.theme === 'dark' ? (theme.theme = 'light') : (theme.theme = 'dark'))}
	>light/dark</button
	>
	TODO	
	-->
	{@render children()}
</div>

<style>
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	nav {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid var(--border);
		background: var(--neutral);
		padding: 8px 16px;
	}

	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
	}

	a {
		text-decoration: none;
		background: var(--bg);
		padding: 4px 8px;
		border-radius: 4px;
		&:visited {
			color: inherit;
		}
	}
</style>

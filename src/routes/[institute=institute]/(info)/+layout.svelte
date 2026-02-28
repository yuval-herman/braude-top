<script>
	const { children } = $props();
</script>

<div class="container">
	{@render children()}
</div>

<style>
	.container {
		margin: 1rem;
		border-radius: 12px;
		background: var(--bg);
		flex-grow: 1;
	}
	@media (max-width: 400px) {
		.container {
			margin: 0;
		}
	}
</style>

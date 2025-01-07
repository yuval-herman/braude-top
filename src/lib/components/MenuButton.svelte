<script lang="ts">
	import { sidebar } from '$lib/state.svelte';
</script>

<button aria-label="רשימת קורסים" onclick={() => (sidebar.isOpen = !sidebar.isOpen)}
	><svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<line x1="3" y1="6" x2="21" y2="6" />
		<line x1="3" y1="12" x2="21" y2="12" />
		<line x1="3" y1="18" x2="21" y2="18" />
	</svg>
</button>

<style>
	button {
		position: absolute;
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;

		border-top-right-radius: 12px;
		font-weight: bold;
		border: solid 1px var(--border);
	}

	@media (width > 770px) {
		button {
			display: none;
		}
	}
</style>

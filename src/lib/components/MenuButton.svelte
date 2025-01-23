<script lang="ts">
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
</script>

<button
	aria-label="רשימת קורסים"
	onclick={() => (page.state.sidebarOpen ? history.back() : pushState('', { sidebarOpen: true }))}
	class="icon-menu"
>
</button>

<style>
	button {
		position: absolute;
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
		border-top-right-radius: 12px;
		font-size: 1.3em;
	}

	@media (width > 770px) {
		button {
			display: none;
		}
	}
</style>

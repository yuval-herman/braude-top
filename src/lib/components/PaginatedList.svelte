<script lang="ts">
	type ListItem = { display: string; onclick: () => void };
	const { items, itemPerPage = 10 }: { items: ListItem[]; itemPerPage?: number } = $props();
	let currentPage = $state(0);

	const lastPage = $derived(Math.floor(items.length / itemPerPage));
	const pageItems = $derived(
		items.slice(itemPerPage * currentPage, itemPerPage * (currentPage + 1))
	);
</script>

<div class="container">
	<header>
		<nav>
			<button onclick={() => (currentPage--, currentPage < 0 && (currentPage = lastPage))}
				>הקודם</button
			>
			<button onclick={() => (currentPage = (currentPage + 1) % (lastPage + 1))}>הבא</button>
		</nav>
		<span id="page-counter">{currentPage}</span>
	</header>
	<ul>
		{#each pageItems as item}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<li onclick={item.onclick}>{item.display}</li>
		{/each}
	</ul>
</div>

<style>
	.container {
		height: 100%;
		max-width: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: 16px;
	}
	header {
		display: flex;
		justify-content: space-between;
	}
	#page-counter {
		background-color: var(--top-bg);
		border-radius: 4px;
		padding: 4px;
		margin: 4px;
	}
	ul {
		flex-grow: 1;
		list-style-type: none;
		margin: 0;
		padding: 0;
		background-color: var(--bg);
		padding: 8px;
		border-radius: 12px;
		overflow: scroll;
	}
	li {
		background-color: var(--top-bg);
		margin: 12px;
		padding: 8px;
		padding-right: 16px;
		border-radius: 12px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		cursor: pointer;
	}
	button {
		padding: 4px 8px;
		border-radius: 4px;
		background-color: var(--top-bg);
	}
</style>

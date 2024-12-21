<script lang="ts">
	type ListItem = string;
	const { items }: { items: ListItem[] } = $props();
	let currentPage = $state(0);

	let listHeight = $state<number>();
	let itemHeight = $state<number>();
	const itemGap = 12;
	const itemPerPage = $derived(
		listHeight && itemHeight ? listHeight / (itemHeight + itemGap + 2) : 10
	);

	const lastPage = $derived(Math.floor(items.length / itemPerPage));
	const pageItems = $derived(
		items.slice(itemPerPage * currentPage, itemPerPage * (currentPage + 1))
	);

	// Handle changes when resizing the window
	$effect(() => {
		if (currentPage > lastPage) currentPage = lastPage;
	});
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
	<ul bind:clientHeight={listHeight}>
		{#each pageItems as item}
			<li bind:clientHeight={itemHeight}>{item}</li>
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
		overflow: hidden;
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
	}
	button {
		padding: 4px 8px;
		border-radius: 4px;
		background-color: var(--top-bg);
	}
</style>

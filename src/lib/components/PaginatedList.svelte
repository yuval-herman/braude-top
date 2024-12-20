<!-- success!
1. 1 string item
2. multiple items
3. items can be deleted and added
4. pages
-->
<script lang="ts">
	type ListItem = string;
	const { items }: { items: ListItem[] } = $props();
</script>

<ul>
	{#each items as item}
		<li>{item}</li>
	{/each}
</ul>

<style>
	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
		background-color: var(--bg);
		padding: 8px;
	}
	li {
		background-color: var(--top-bg);
		margin: 12px;
		padding: 8px;
		padding-right: 16px;
		border-radius: 12px;
	}
</style>

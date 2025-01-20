<script lang="ts">
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';

	const { data, form } = $props();
	const { user, messages } = data;
</script>

<div class="container">
	<h1>שלום, {user.name}!</h1>

	{#if form}
		{#if form?.success}
			<span transition:slide class="success">הודעה נמחקה!</span>
		{:else if !form?.success}
			<span transition:slide class="failure">ההודעה לא נמחקה...</span>
		{/if}
	{/if}
	{#if messages.length > 0}
		<h2>הודעות:</h2>
		{#each messages as message, i}
			<div class="message">
				<div class="message-header">
					<span>{message.date}</span> | <span>{message.type}</span> |
					<span>{message.email || 'ללא מייל'}</span> | <span>{message.name || 'שם לא צויין'}</span>
				</div>
				<div class="message-body">
					<p>{message.message}</p>
				</div>
				<form method="POST" action="?/delete-message" use:enhance>
					<input type="hidden" name="id" value={message.id} />
					<button type="submit">מחק</button>
				</form>
			</div>
		{/each}
	{:else}
		<p>אין הודעות להצגה.</p>
	{/if}
</div>

<style>
	.success,
	.failure {
		padding: 8px;
		border-radius: 8px;
	}
	.failure {
		background: var(--warn);
	}
	.success {
		background: var(--success);
	}
	.container {
		padding: 1rem;
		background: var(--bg);
		color: var(--text);
	}

	.message {
		border: 1px solid var(--border);
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		border-radius: 4px;
		background: var(--neutral);
		color: var(--text);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
	}

	.message-header {
		flex: 1 1 auto;
		margin-bottom: 0.5rem;
		font-weight: bold;
		color: var(--text-secondary);
	}

	.message-body {
		flex: 1 1 100%;
		margin-bottom: 0.5rem;
	}

	form {
		display: inline;
	}

	button {
		background: var(--warn);
		color: var(--text-light);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.3s;
	}

	button:hover {
		background: darken(var(--warn), 10%);
	}
</style>

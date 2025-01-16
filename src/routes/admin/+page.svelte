<script lang="ts">
	const { data } = $props();
</script>

{#if data.user}
	שלום, {data.user.id}! אני רואה שהתחברת עם {data.signedBy}
{:else}
	נראה שלא הצלחת להתחבר...
{/if}

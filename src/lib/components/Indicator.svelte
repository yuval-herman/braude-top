<script lang="ts">
	interface Props {
		color: string;
	}
	const { color }: Props = $props();
</script>

<span class="indicator" style:--indicator-color={color}></span>

<style>
	.indicator {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		border-top-right-radius: inherit;
		border-bottom-right-radius: inherit;
		background: var(--indicator-color);
		width: 8px;
	}
</style>

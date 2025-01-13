<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MenuButton from '$lib/components/MenuButton.svelte';

	const { Story } = defineMeta({
		title: 'MenuButton',
		component: MenuButton,
	});
</script>

<Story name="Button" />

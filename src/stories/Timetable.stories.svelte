<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TimeTable from '$lib/components/TimeTable.svelte';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'TimeTable',
		component: TimeTable,
		tags: ['autodocs']
	});
</script>

<Story name="Empty" />

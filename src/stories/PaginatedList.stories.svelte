<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PaginatedList from '$lib/components/PaginatedList.svelte';
	import items from '../fullcourses.json';
	const { Story } = defineMeta({
		title: 'PaginatedList',
		component: PaginatedList,
	});
</script>

<Story name="Empty" args={{ items: [] }} />
<Story name="One page" args={{ items: items.slice(-0, 15), itemPerPage: 15 }} />
<Story name="Many pages" args={{ items }} />

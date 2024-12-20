<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PaginatedList from '$lib/components/PaginatedList.svelte';

	const { Story } = defineMeta({
		title: 'PaginatedList',
		component: PaginatedList
	});
	const items = ['מתמטיקה', 'פיזיקה', 'כימיה', 'ספרות', 'היסטוריה', 'אנגלית'];
</script>

<Story name="Empty" />
<Story name="One page" args={{ items }} />
<Story name="Three pages" args={{ items: Array(6).fill(items).flat() }} />
<Story name="Many pages" args={{ items: Array(100).fill(items).flat() }} />

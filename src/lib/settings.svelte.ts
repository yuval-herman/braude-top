import { browser } from '$app/environment';
import { page } from '$app/state';
import { writable } from 'svelte/store';
import { TypedLocalStorage } from './storage';

export const settings = writable<Settings>(
	(browser && TypedLocalStorage.getItem('settings')) || {
		show_walk_times: true,
		anonymous_comment: true,
		columns_margins: true,
		show_lunch: true,
	}
);

settings.subscribe((v) => {
	if (!browser) return;
	TypedLocalStorage.setItem('settings', v);
	if (page.data.user) navigator.sendBeacon('/api/user/data/update/settings', JSON.stringify(v));
});

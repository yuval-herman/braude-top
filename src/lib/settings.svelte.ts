import { browser } from '$app/environment';
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
	if (browser) TypedLocalStorage.setItem('settings', v);
});

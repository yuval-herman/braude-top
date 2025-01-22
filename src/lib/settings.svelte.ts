import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { TypedLocalStorage } from './storage';
import { debounce } from './utils/utils';
import { page } from '$app/state';

export const settings = writable<Settings>(
	(browser && TypedLocalStorage.getItem('settings')) || {
		show_walk_times: true,
		anonymous_comment: true,
		columns_margins: true,
		show_lunch: true,
	}
);

const sendToServer = debounce((settingsObj: Settings) => {
	if (!browser) return;
	navigator.sendBeacon('/user/data/update/settings', JSON.stringify(settingsObj));
}, 5000);

settings.subscribe((v) => {
	if (!browser) return;
	TypedLocalStorage.setItem('settings', v);
	if (page.data.user) sendToServer(v);
});

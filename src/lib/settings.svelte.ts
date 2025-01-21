import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { TypedLocalStorage } from './storage';

export const settings = writable<Settings>(
	(browser && TypedLocalStorage.getItem('settings')) || {}
);

settings.subscribe((v) => {
	if (browser) TypedLocalStorage.setItem('settings', v);
});

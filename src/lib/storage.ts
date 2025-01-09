import { browser, version } from '$app/environment';
import semverMinor from 'semver/functions/minor';

interface StorageItems {
	selected: FullCourse[];
	version: string; // semver, can be compared with normal comparison operators
	onboarded: boolean; // whether the user has been onboraded
}

export class TypedLocalStorage {
	static getItem<TKey extends keyof StorageItems>(key: TKey): StorageItems[TKey] | null {
		const jsonValue = localStorage.getItem(key);
		return jsonValue && JSON.parse(jsonValue);
	}

	static setItem<TKey extends keyof StorageItems>(key: TKey, value: StorageItems[TKey]): void {
		const jsonValue = JSON.stringify(value);
		localStorage.setItem(key, jsonValue);
	}

	static removeItem<TKey extends keyof StorageItems>(key: TKey): void {
		localStorage.removeItem(key);
	}

	static hasKey<TKey extends keyof StorageItems>(key: TKey): boolean {
		return key in localStorage;
	}
}

if (browser) {
	const localVersion = TypedLocalStorage.getItem('version');
	if (
		localVersion &&
		semverMinor(localVersion) < semverMinor(version) &&
		TypedLocalStorage.hasKey('selected')
	) {
		alert('האתר עודכן ולכן המערכת השמורה נמחקה');
		TypedLocalStorage.removeItem('selected');
		TypedLocalStorage.removeItem('onboarded');
	}
	TypedLocalStorage.setItem('version', version);
}

import { browser, version } from '$app/environment';

import semverMinor from 'semver/functions/minor';

interface StorageItems {
	[key: `selected-${number}-${string}`]: FullCourse[];
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

	static keys(): (keyof StorageItems)[] {
		return Object.keys(localStorage) as (keyof StorageItems)[];
	}
}

export function getCurrentSelected(year: number, semester: string): FullCourse[] {
	if (!browser) return [];
	return TypedLocalStorage.getItem(`selected-${year}-${semester}`) ?? [];
}
export function setCurrentSelected(courses: FullCourse[], year: number, semester: string) {
	if (!browser) return;
	console.log(year, semester);

	return TypedLocalStorage.setItem(`selected-${year}-${semester}`, courses);
}

if (browser) {
	const localVersion = TypedLocalStorage.getItem('version');
	const selectedList = TypedLocalStorage.keys().filter((k) => k.startsWith('selected'));
	if (localVersion && semverMinor(localVersion) < semverMinor(version) && selectedList.length) {
		alert('האתר עודכן ולכן המערכת השמורה נמחקה');
		selectedList.forEach(TypedLocalStorage.removeItem);
	}
	TypedLocalStorage.setItem('version', version);
}

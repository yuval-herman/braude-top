import { browser, version } from '$app/environment';
import semverMinor from 'semver/functions/minor';

interface StorageItems {
	[key: `selected-${number}-${string}`]: FullCourse[];
	[key: `active-${number}-${string}`]: number[];
	[key: `rooms-${number}-${string}`]: EmptyRoom[];
	version: string; // semver, can be compared with normal comparison operators
	onboarded: boolean; // whether the user has been onboraded
	settings: Settings;
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

export function getCurrentCourses(year: number, semester: string): FullCourse[] {
	if (!browser) return [];
	return TypedLocalStorage.getItem(`selected-${year}-${semester}`) ?? [];
}
export function setCurrentCourses(courses: FullCourse[], year: number, semester: string) {
	if (!browser) return;
	return TypedLocalStorage.setItem(`selected-${year}-${semester}`, courses);
}
export function getCurrentActiveInstances(year: number, semester: string) {
	return TypedLocalStorage.getItem(`active-${year}-${semester}`);
}
export function setCurrentActiveInstances(instance_ids: number[], year: number, semester: string) {
	return TypedLocalStorage.setItem(`active-${year}-${semester}`, instance_ids);
}

export function getCurrentEmptyRooms(year: number, semester: string): EmptyRoom[] {
	if (!browser) return [];
	return TypedLocalStorage.getItem(`rooms-${year}-${semester}`) ?? [];
}
export function setCurrentEmptyRooms(rooms: EmptyRoom[], year: number, semester: string) {
	if (!browser) return;
	return TypedLocalStorage.setItem(`rooms-${year}-${semester}`, rooms);
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

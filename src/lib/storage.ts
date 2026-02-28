import { browser, version } from '$app/environment';
import semverMinor from 'semver/functions/minor';
import type { Institute } from './utils/constants.utils';

interface StorageItems {
	[
		key: `${Institute}-selected-${SemesterCourse['year']}-${SemesterSession['semester']}`
	]: SemesterCourse[];
	[
		key: `${Institute}-active-${SemesterCourse['year']}-${SemesterSession['semester']}`
	]: StrippedCourseInstance['instance_id'][];
	[key: `${Institute}-rooms-${SemesterCourse['year']}-${SemesterSession['semester']}`]: EmptyRoom[];
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

export function getCurrentCourses(
	institute: Institute,
	year: SemesterCourse['year'],
	semester: SemesterSession['semester']
): SemesterCourse[] {
	if (!browser) return [];
	return TypedLocalStorage.getItem(`${institute}-selected-${year}-${semester}`) ?? [];
}
export function setCurrentCourses(
	institute: Institute,
	courses: SemesterCourse[],
	year: SemesterCourse['year'],
	semester: SemesterSession['semester']
) {
	if (!browser) return;
	return TypedLocalStorage.setItem(`${institute}-selected-${year}-${semester}`, courses);
}
export function getCurrentActiveInstances(
	institute: Institute,
	year: SemesterCourse['year'],
	semester: SemesterSession['semester']
) {
	return TypedLocalStorage.getItem(`${institute}-active-${year}-${semester}`);
}
export function setCurrentActiveInstances(
	institute: Institute,
	instance_ids: StrippedCourseInstance['instance_id'][],
	year: SemesterCourse['year'],
	semester: SemesterSession['semester']
) {
	return TypedLocalStorage.setItem(`${institute}-active-${year}-${semester}`, instance_ids);
}

export function getCurrentEmptyRooms(
	institute: Institute,
	year: number,
	semester: string
): EmptyRoom[] {
	if (!browser) return [];
	return TypedLocalStorage.getItem(`${institute}-rooms-${year}-${semester}`) ?? [];
}
export function setCurrentEmptyRooms(
	institute: Institute,
	rooms: EmptyRoom[],
	year: number,
	semester: string
) {
	if (!browser) return;
	return TypedLocalStorage.setItem(`${institute}-rooms-${year}-${semester}`, rooms);
}

if (browser) {
	const localVersion = TypedLocalStorage.getItem('version');
	const selectedList = TypedLocalStorage.keys().filter((k) => k.startsWith('selected'));
	if (localVersion && semverMinor(localVersion) < semverMinor(version) && selectedList.length) {
		alert('האתר עודכן ולכן המערכת השמורה נמחקה');
		localStorage.clear();
	}
	TypedLocalStorage.setItem('version', version);
}

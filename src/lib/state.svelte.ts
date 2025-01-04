import { browser, version } from '$app/environment';
import { TypedLocalStorage } from './storage';

if (browser) {
	const localVersion = TypedLocalStorage.getItem('version');
	if (localVersion && localVersion < version && TypedLocalStorage.hasKey('selected')) {
		alert('האתר עודכן ולכן המערכת השמורה נמחקה');
		TypedLocalStorage.removeItem('selected');
	}
	TypedLocalStorage.setItem('version', version);
}

export const hoveredInstance = $state<{ items: Item[] }>({ items: [] });

export const selectedCourses = $state<FullCourse[]>(
	(() => {
		if (!browser) return [];
		const cache = TypedLocalStorage.getItem('selected');
		return cache || [];
	})()
);

export function addSelectedCourse(course: FullCourse) {
	const exitingCourse = selectedCourses.find((c) => c.course_id === course.course_id);
	if (exitingCourse) {
		const exitingInstancesIds = exitingCourse.instances.map((i) => i.course_instance_id);
		exitingCourse.instances.push(
			...course.instances.filter(
				({ course_instance_id }) => !exitingInstancesIds.includes(course_instance_id)
			)
		);
	} else {
		selectedCourses.push(course);
	}
	browser && TypedLocalStorage.setItem('selected', selectedCourses);
}
export function removeSelectedCourse(course: FullCourse) {
	const i = selectedCourses.findIndex((c) => c.course_id === course.course_id);
	if (i === -1) throw new Error('Tried to remove non exiting course');
	const exitingCourse = selectedCourses[i];
	const courseInstancesIds = course.instances.map((i) => i.course_instance_id);
	const instances = exitingCourse.instances.filter(
		(i) => !courseInstancesIds.includes(i.course_instance_id)
	);

	if (instances.length < 1) {
		selectedCourses.splice(i, 1);
	} else {
		exitingCourse.instances = instances;
	}
	browser && TypedLocalStorage.setItem('selected', selectedCourses);
}

export const sidebar = $state({ isOpen: false });

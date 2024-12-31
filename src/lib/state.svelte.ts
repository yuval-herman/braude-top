import type { FullCourse, Item } from './types';

export const hoveredInstance = $state<{ items: Item[] }>({ items: [] });
export const selectedCourses = $state<FullCourse[]>([]);
export function addSelectedCourse(course: FullCourse) {
	const exitingCourse = selectedCourses.find((c) => c.course_id === course.course_id);
	if (exitingCourse) {
		exitingCourse.instances = new Set(exitingCourse.instances.concat(course.instances))
			.values()
			.toArray();
	} else {
		selectedCourses.push(course);
	}
}

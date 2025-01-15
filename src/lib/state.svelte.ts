import { browser } from '$app/environment';
import { setCurrentSelected } from './storage';

export const hoveredInstance = $state<{ items: Item[] }>({ items: [] });
export const theme = $state<{ theme: 'auto' | 'light' | 'dark' }>({ theme: 'auto' });
export const undoStack: FullCourse[][] = [];
export const redoStack: FullCourse[][] = [];
export const selectedCourses = $state<FullCourse[]>([]);

export function addSelectedCourse(course: FullCourse, year: number, semester: string) {
	undoStack.push($state.snapshot(selectedCourses));
	redoStack.length = 0;

	const exitingCourse = selectedCourses.find((c) => c.course_id === course.course_id);
	if (exitingCourse) {
		const exitingInstancesIds = exitingCourse.instances.map((i) => i.course_instance_id);
		exitingCourse.instances.push(
			...course.instances.filter(
				({ course_instance_id }) => !exitingInstancesIds.includes(course_instance_id)
			)
		);
	} else {
		selectedCourses.push(structuredClone(course));
	}
	browser && setCurrentSelected(selectedCourses, year, semester);
}

export function removeSelectedCourse(course: FullCourse, year: number, semester: string) {
	undoStack.push($state.snapshot(selectedCourses));
	redoStack.length = 0;

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
	browser && setCurrentSelected(selectedCourses, year, semester);
}

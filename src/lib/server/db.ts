import type { CourseInstance, Session } from '$lib/types';
import Database from 'better-sqlite3';

const db = new Database('src/lib/courses.db');

/** Retrieves all the courses names and ids */
export const getCoursesMinimal = (() => {
	const stmt = db.prepare<[], { course_id: number; name: string }>(
		'SELECT course_id, name FROM courses ORDER by name'
	);
	return () => stmt.all();
})();

/** Retrieves all the course instances for a given course id */
export const getCourseInstances = (() => {
	const stmt = db.prepare<number, CourseInstance>(
		'SELECT * FROM course_instances WHERE course_id = ?'
	);
	return (id: number | string) => stmt.all(id as number);
})();

/** Retrieves all the instance session for a given course instance id */
export const getInstancesSession = (() => {
	const stmt = db.prepare<number, Session>('SELECT * from sessions where course_instance_id = ?');
	return (id: number | string) => stmt.all(id as number);
})();

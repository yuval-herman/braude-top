import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

const DB_PATH = join(cwd(), 'src/lib/courses.db');
const OUTPUT_PATH = join(cwd(), 'src/fullcourses.json');
const db = new Database(DB_PATH);

export const getNonEmptyCourses = (() => {
	const stmt = db.prepare(
		'SELECT distinct c.* from courses c \
		join course_instances using (course_id) \
		join sessions USING (course_instance_id)'
	);
	return () => stmt.all();
})();

export const getNonEmptyCourseInstances = (() => {
	const stmt = db.prepare(
		'SELECT distinct c.* from course_instances c \
		JOIN sessions USING (course_instance_id) \
		WHERE course_id = ?'
	);
	return (id) => stmt.all(id);
})();

export const getInstancesSession = (() => {
	const stmt = db.prepare('SELECT * from sessions where course_instance_id = ?');
	return (id) => stmt.all(id);
})();

export const getInstancesExams = (() => {
	const stmt = db.prepare('SELECT * from exams WHERE course_instance_id = ?');
	return (id) => stmt.all(id);
})();

const full_courses = getNonEmptyCourses().map((course) => ({
	...course,
	instances: getNonEmptyCourseInstances(course.course_id).map((instance) => ({
		...instance,
		sessions: getInstancesSession(instance.course_instance_id),
		exams: getInstancesExams(instance.course_instance_id),
	})),
}));

writeFileSync(OUTPUT_PATH, JSON.stringify(full_courses));

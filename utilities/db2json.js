import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

const DB_PATH = join(cwd(), 'data/courses.db');
const OUTPUT_PATH = join(cwd(), 'src/fullcourses.json');
const db = new Database(DB_PATH);

export const getNonEmptyCourses = (() => {
	const stmt = db.prepare(
		'SELECT distinct c.* from courses c \
		join course_instances using (course_id) \
		join sessions USING (course_instance_id)\
		where c.year = ?'
	);
	return (year) => stmt.all(year);
})();

export const getNonEmptyCourseInstances = (() => {
	const stmt = db.prepare(
		'SELECT distinct c.* from course_instances c \
		JOIN sessions USING (course_instance_id) \
		WHERE course_id = ? and year = ?'
	);
	return (id, year) => stmt.all(id, year).map(transformCourseInstance);
})();

export const getInstancesSession = (() => {
	const stmt = db.prepare('SELECT * from sessions where course_instance_id = ?');
	return (id) => stmt.all(id);
})();

function transformCourseInstance(instance) {
	if (typeof instance.faculty === 'string') instance.faculty = JSON.parse(instance.faculty);
	return instance;
}

export const getInstancesExams = (() => {
	const stmt = db.prepare('SELECT * from exams WHERE course_instance_id = ?');
	return (id) => stmt.all(id);
})();

const year = new Date().getFullYear();
const full_courses = getNonEmptyCourses(year).map((course) => ({
	...course,
	instances: getNonEmptyCourseInstances(course.course_id, year).map((instance) => ({
		...instance,
		sessions: getInstancesSession(instance.course_instance_id),
		exams: getInstancesExams(instance.course_instance_id),
	})),
}));

writeFileSync(OUTPUT_PATH, JSON.stringify(full_courses));

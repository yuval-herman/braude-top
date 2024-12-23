import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { cwd, exit } from 'process';

const DB_PATH = join(cwd(), 'src/lib/courses.db');
const OUTPUT_PATH = join(cwd(), 'src/fullcourses.json');
const db = new Database(DB_PATH);

export const getCoursesMinimal = (() => {
	const stmt = db.prepare('SELECT * FROM courses ORDER by name');
	return () => stmt.all();
})();

export const getCourseInstances = (() => {
	const stmt = db.prepare('SELECT * FROM course_instances WHERE course_id = ?');
	return (id) => stmt.all(id);
})();

export const getInstancesSession = (() => {
	const stmt = db.prepare('SELECT * from sessions where course_instance_id = ?');
	return (id) => stmt.all(id);
})();

const full_courses = [];

for (const course of getCoursesMinimal()) {
	const full_course = course;
	const instances = getCourseInstances(course.course_id);
	full_course.instances = [];
	for (const instance of instances) {
		const full_instance = instance;
		const sessions = getInstancesSession(instance.course_instance_id);
		full_instance.sessions = sessions;
		full_course.instances.push(full_instance);
	}
	full_courses.push(full_course);
}
writeFileSync(OUTPUT_PATH, JSON.stringify(full_courses));

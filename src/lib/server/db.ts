import Database from 'better-sqlite3';

const db = new Database('data/courses.db');

/** Retrieves all the courses */
export const getCourses = (() => {
	const stmt = db.prepare<[], Course>('SELECT * FROM courses ORDER by name');
	return () => stmt.all();
})();

/** Retrieves all the courses that have sessions*/
export const getNonEmptyCourses = (() => {
	const stmt = db.prepare<[], Course>(
		'SELECT distinct c.* from courses c \
		join course_instances using (course_id) \
		join sessions USING (course_instance_id)'
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

/** Retrieves all the course instances for a given course id that have sessions*/
export const getNonEmptyCourseInstances = (() => {
	const stmt = db.prepare<number, CourseInstance>(
		'SELECT distinct c.* from course_instances c \
		JOIN sessions USING (course_instance_id) \
		WHERE course_id = ?'
	);
	return (id: number | string) => stmt.all(id as number);
})();

/** Retrieves all the instance session for a given course instance id */
export const getInstancesSession = (() => {
	const stmt = db.prepare<number, CourseSession>(
		'SELECT * from sessions where course_instance_id = ?'
	);
	return (id: number | string) => stmt.all(id as number);
})();

/** Retrieves all the exams for a given course instance id */
export const getInstancesExams = (() => {
	const stmt = db.prepare<number, CourseExam>('SELECT * from exams WHERE course_instance_id = ?');
	return (id: number | string) => stmt.all(id as number);
})();

import Database from 'better-sqlite3';

const coursesDB = new Database('data/courses.db');

/** Retrieves all the courses */
export const getCourses = (() => {
	const stmt = coursesDB.prepare<[], Course>('SELECT * FROM courses ORDER by name');
	return () => stmt.all();
})();

/** Retrieves full course by id */
export const getFullCourse = (() => {
	const courseStmt = coursesDB.prepare<number, Course>('SELECT * from courses WHERE course_id = ?');
	return (id: number | string): FullCourse | undefined => {
		const course = courseStmt.get(id as number);
		if (course === undefined) return;

		const instances: FullCourseInstance[] = getCourseInstances(id as number).map((instance) => {
			const sessions = getInstancesSession(instance.course_instance_id);
			const exams = getInstancesExams(instance.course_instance_id);
			return { ...instance, sessions, exams };
		});

		return { ...course, instances };
	};
})();

/** Retrieves all the courses that have sessions*/
export const getNonEmptyCourses = (() => {
	const stmt = coursesDB.prepare<[], Course>(
		'SELECT distinct c.* from courses c \
		join course_instances using (course_id) \
		join sessions USING (course_instance_id)'
	);
	return () => stmt.all();
})();

/** Retrieves all the course instances for a given course id */
export const getCourseInstances = (() => {
	const stmt = coursesDB.prepare<number, CourseInstance>(
		'SELECT * FROM course_instances WHERE course_id = ?'
	);
	return (id: number | string) => stmt.all(id as number).map(transformCourseInstance);
})();

/** Retrieves all the course instances for a given course id that have sessions*/
export const getNonEmptyCourseInstances = (() => {
	const stmt = coursesDB.prepare<number, CourseInstance>(
		'SELECT distinct c.* from course_instances c \
		JOIN sessions USING (course_instance_id) \
		WHERE course_id = ?'
	);
	return (id: number | string) => stmt.all(id as number).map(transformCourseInstance);
})();

/** Retrieves all the instance session for a given course instance id */
export const getInstancesSession = (() => {
	const stmt = coursesDB.prepare<number, CourseSession>(
		'SELECT * from sessions where course_instance_id = ?'
	);
	return (id: number | string) => stmt.all(id as number);
})();

/** Retrieves all the exams for a given course instance id */
export const getInstancesExams = (() => {
	const stmt = coursesDB.prepare<number, CourseExam>(
		'SELECT * from exams WHERE course_instance_id = ?'
	);
	return (id: number | string) => stmt.all(id as number);
})();

/** Retrieves the actual years that exists on courses in the db */
export const getYearsAvailable = (() => {
	const stmt = coursesDB
		.prepare<[], number>('SELECT DISTINCT year FROM courses ORDER by year DESC')
		.pluck();
	return () => stmt.all();
})();

/** Retrieves the actual years that exists on courses in the db */
export const getSemestersAvailable = (() => {
	const stmt = coursesDB
		.prepare<number, number>(
			'SELECT DISTINCT semester FROM sessions\
			JOIN course_instances USING (course_instance_id)\
			WHERE year = ?\
			ORDER by semester'
		)
		.pluck();
	return (year: number) => stmt.all(year);
})();

function transformCourseInstance(instance: CourseInstance): CourseInstance {
	if (typeof instance.faculty === 'string') instance.faculty = JSON.parse(instance.faculty);
	return instance;
}

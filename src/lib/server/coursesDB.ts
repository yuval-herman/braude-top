import Database from 'better-sqlite3';

const coursesDB = new Database('data/courses.db');

/** Retrieves all the courses */
export const getCourses = (() => {
	const stmt = coursesDB.prepare<[], Course>('SELECT * FROM courses ORDER by name');
	return () => stmt.all();
})();

/** Check if a course exists in the db */
export const checkCourse = (() => {
	const stmt = coursesDB.prepare<[number, number], boolean>(
		'SELECT EXISTS(SELECT 1 FROM courses WHERE course_id = ? and year = ?)'
	);
	return (id: number | string, year: number) => Boolean(stmt.get(id as number, year));
})();

/** Retrieves full course by id */
export const getFullCourse = (() => {
	const courseStmt = coursesDB.prepare<[number, number], Course>(
		'SELECT * from courses WHERE course_id = ? and year = ?'
	);
	return (id: number | string, year: number): FullCourse | undefined => {
		const course = courseStmt.get(id as number, year);
		if (course === undefined) return;

		const instances: FullCourseInstance[] = getCourseInstances(id as number, year).map(
			(instance) => {
				const sessions = getInstancesSession(instance.course_instance_id);
				const exams = getInstancesExams(instance.course_instance_id);
				return { ...instance, sessions, exams };
			}
		);

		return { ...course, instances };
	};
})();

/** Search all the course  that have sessions for a query*/
export const queryNonEmptyCourses = (() => {
	type Args = {
		year: number;
		semester: string;
		query: string;
	};

	const stmt = coursesDB.prepare<Args, Course>(
		"SELECT distinct c.* from courses c\
		join course_instances using (course_id)\
		join sessions USING (course_instance_id)\
		WHERE c.year = :year AND semester = :semester\
		AND c.name like '%' || :query || '%'\
		LIMIT 5"
	);

	return (args: Args) => stmt.all(args);
})();

/** Retrieves all the course instances for a given course id */
export const getCourseInstances = (() => {
	const stmt = coursesDB.prepare<[number, number], CourseInstance>(
		'SELECT * FROM course_instances WHERE course_id = ? and year = ?'
	);
	return (id: number | string, year: number) =>
		stmt.all(id as number, year).map(transformCourseInstance);
})();

/** Retrieves all the course instances for a given course id that have sessions*/
export const getNonEmptyCourseInstances = (() => {
	const stmt = coursesDB.prepare<[number, number], CourseInstance>(
		'SELECT distinct c.* from course_instances c\
		 JOIN sessions USING (course_instance_id)\
		 WHERE course_id = ? and year = ?'
	);
	return (id: number | string, year: number) =>
		stmt.all(id as number, year).map(transformCourseInstance);
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

/** Retrieves the semesters that exists for a given year in the db */
export const getSemestersAvailable = (() => {
	const stmt = coursesDB
		.prepare<number, string>(
			'SELECT DISTINCT semester FROM sessions\
			JOIN course_instances USING (course_instance_id)\
			WHERE year = ?\
			ORDER by semester'
		)
		.pluck();
	return (year: number) => stmt.all(year);
})();

/** Retrieves empty rooms by year, semester and week day */
export const getEmptyRoomsByDay = (() => {
	type Args = {
		year: number;
		semester: string;
		week_day: string;
	};

	const stmt = coursesDB.prepare<Args, EmptyRoom>(
		"SELECT * FROM empty_rooms\
			 WHERE year = :year\
			 AND semester = :semester\
			 AND week_day = :week_day\
			 AND room != ''"
	);
	return (args: Args) => stmt.all(args);
})();

/** Retrieves room empty sessions by year and semester */
export const getEmptyRoomsByRoom = (() => {
	type Args = {
		year: number;
		semester: string;
		room: string;
	};

	const stmt = coursesDB.prepare<Args, EmptyRoom>(
		'SELECT * FROM empty_rooms\
			 WHERE year = :year\
			 AND semester = :semester\
			 AND room = :room'
	);
	return (args: Args) => stmt.all(args);
})();

function transformCourseInstance(instance: CourseInstance): CourseInstance {
	if (typeof instance.faculty === 'string') instance.faculty = JSON.parse(instance.faculty);
	return instance;
}

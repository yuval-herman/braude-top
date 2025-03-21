import Database from 'better-sqlite3';

const coursesDB = new Database('data/courses.db');

/** Retrieves all the courses */
export const getCourses = (() => {
	const stmt = coursesDB.prepare<[], Course>('SELECT * FROM courses ORDER by name');
	return () => stmt.all();
})();

/** Retrieves one course by id and year */
export const getCourse = (() => {
	const stmt = coursesDB.prepare<[number, number], Course>(
		'SELECT * from courses WHERE course_id = ? and year = ?'
	);
	return (id: number | string, year: number) => stmt.get(id as number, year);
})();

/** Retrieves one course identifier by id and year */
export const getCourseIdentifier = (() => {
	const stmt = coursesDB.prepare<[number, number], CourseIdentifier>(
		'SELECT course_id, year, last_modified from courses WHERE course_id = ? and year = ?'
	);
	return (id: number | string, year: number) => stmt.get(id as number, year);
})();

/** Retrieves all instance hashes for a given course semester */
export const getCourseInstanceHashes = (() => {
	interface Args {
		course_id: number;
		year: number;
		semester: string;
	}
	const stmt = coursesDB
		.prepare<Args, string>(
			'SELECT full_instance_hash FROM course_instances\
			 join sessions USING (course_instance_id)\
			 WHERE course_id = :course_id and year = :year AND semester = :semester'
		)
		.pluck();
	return (args: Args) => stmt.all(args);
})();

/** Check if a course exists in the db */
export const checkCourse = (() => {
	const stmt = coursesDB.prepare<[number, number], boolean>(
		'SELECT EXISTS(SELECT 1 FROM courses WHERE course_id = ? and year = ?)'
	);
	return (id: number | string, year: number) => Boolean(stmt.get(id as number, year));
})();

/** Check if an instance hash exists in the db */
export const checkInstanceHash = (() => {
	const stmt = coursesDB.prepare<string, boolean>(
		'SELECT EXISTS(SELECT 1 FROM course_instances WHERE full_instance_hash = ?)'
	);
	return (hash: string) => Boolean(stmt.get(hash));
})();

export const getCourseLastModified = (() => {
	const stmt = coursesDB
		.prepare<
			[number, number],
			string
		>('SELECT last_modified FROM courses WHERE course_id = ? and year = ?')
		.pluck();
	return (id: number | string, year: number) => stmt.get(id as number, year);
})();

/** Retrieves full course by id and year */
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

/** Retrieves full instance by id or hash */
export const getFullInstance = (() => {
	const idStmt = coursesDB.prepare<number, CourseInstance>(
		'SELECT * from course_instances WHERE course_instance_id = ?'
	);
	const hashStmt = coursesDB.prepare<string, CourseInstance>(
		'SELECT * from course_instances WHERE full_instance_hash = ?'
	);
	return (idOrHash: number | string): FullCourseInstance | undefined => {
		const instance = typeof idOrHash === 'string' ? hashStmt.get(idOrHash) : idStmt.get(idOrHash);
		if (!instance) return;
		const sessions = getInstancesSession(instance.course_instance_id);
		const exams = getInstancesExams(instance.course_instance_id);
		return { ...transformCourseInstance(instance), sessions, exams };
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
		join course_instances using (course_id, year)\
		join sessions USING (course_instance_id)\
		WHERE year = :year AND semester = :semester\
		AND name like '%' || :query || '%'\
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
	type Args = {
		course_id: number;
		year: number;
		semester: string;
	};
	const stmt = coursesDB.prepare<Args, CourseInstance>(
		'SELECT distinct c.* from course_instances c\
		 JOIN sessions USING (course_instance_id)\
		 WHERE course_id = :course_id AND year = :year AND semester = :semester'
	);
	return (args: Args) => stmt.all(args).map(transformCourseInstance);
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

/** Retrieves empty rooms by year, semester, week day and start_time */
export const getEmptyRoomsByStart = (() => {
	type Args = {
		year: number;
		semester: string;
		week_day: string;
		start_time: string;
	};

	const stmt = coursesDB.prepare<Args, EmptyRoom>(
		"SELECT * FROM empty_rooms\
			 WHERE year = :year\
			 AND semester = :semester\
			 AND week_day = :week_day\
			 AND start_time = :start_time\
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

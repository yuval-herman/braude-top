import Database from 'better-sqlite3';

const coursesDB = new Database('data/braude.sqlite');

// Any array type is stored in the db as a JSON string, this is the DB representation
type DBStrippedCourseInstance = StrippedCourseInstance & {
	pre_requirements?: string;
	co_requirement_instance_ids?: string;
};

// This function to to transform a DB type course instance into our desired type with proper arrays
function transformInstance(instance: DBStrippedCourseInstance): StrippedCourseInstance {
	return {
		...instance,
		pre_requirements: JSON.parse(instance.pre_requirements || 'null'),
		co_requirement_instance_ids: JSON.parse(instance.co_requirement_instance_ids || 'null'),
	};
}

/** Retrieves all the courses */
export const getCourses = (() => {
	const stmt = coursesDB.prepare<[], StrippedCourse>('SELECT * FROM courses ORDER by name');
	return () => stmt.all();
})();

/** Retrieves one stripped course by id and year */
export const getCourse = (() => {
	const stmt = coursesDB.prepare<[number | string, number], StrippedCourse>(
		'SELECT * from courses WHERE course_id = ? and year = ?'
	);
	return (id: number | string, year: number) => stmt.get(id, year);
})();

/** Check if a course exists in the db */
export const checkCourse = (() => {
	const stmt = coursesDB.prepare<[number, number], boolean>(
		'SELECT EXISTS(SELECT 1 FROM courses WHERE course_id = ? and year = ?)'
	);
	return (id: number | string, year: number) => Boolean(stmt.get(id as number, year));
})();

/** Search all the courses that have sessions for a query*/
export const queryNonEmptyCourses = (() => {
	type Args = {
		year: number;
		semester: string;
		query: string;
	};

	const stmt = coursesDB.prepare<Args, Course>(
		"SELECT distinct c.* from courses c\
		join instances using (course_id, year)\
		join sessions USING (instance_id)\
		WHERE year = :year AND semester = :semester\
		AND name like '%' || :query || '%'\
		LIMIT 5"
	);

	return (args: Args) => stmt.all(args);
})();

/** Retrieves all the course instances for a given course id */
export const getCourseInstances = (() => {
	const stmt = coursesDB.prepare<[number | string, number], DBStrippedCourseInstance>(
		'SELECT * FROM instances WHERE course_id = ? and year = ? order by type'
	);
	return (id: number | string, year: number) => stmt.all(id, year).map(transformInstance);
})();

/** Retrieves all the course instances for a given course id that have sessions */
export const getNonEmptyCourseInstances = (() => {
	type Args = {
		course_id: number;
		year: number;
		semester: string;
	};
	const stmt = coursesDB.prepare<Args, DBStrippedCourseInstance>(
		'SELECT distinct c.* from instances c\
		 JOIN sessions USING (instance_id)\
		 WHERE course_id = :course_id AND year = :year AND semester = :semester\
		 order by type'
	);
	return (args: Args) => stmt.all(args).map(transformInstance);
})();

/** Retrieves all the instance session for a given course instance id for one semester */
export const getInstancesSemesterSessions = (() => {
	const stmt = coursesDB.prepare<[number, string], SemesterSession>(
		'SELECT * from sessions where instance_id = ? and semester = ?'
	);
	return (id: number | string, semester: string) => stmt.all(id as number, semester);
})();

/** Retrieves all the instance session for a given course instance id across all semesters */
export const getInstancesSessions = (() => {
	const stmt = coursesDB.prepare<number, YearlySession>(
		'SELECT * from sessions where instance_id = ?'
	);
	return (id: number | string) => stmt.all(id as number);
})();

/** Retrieves all the exams for a given course instance id */
export const getInstancesExams = (() => {
	const stmt = coursesDB.prepare<number, Exam>('SELECT * from exams WHERE instance_id = ?');
	return (id: number | string) => stmt.all(id as number);
})();

/** Retrieves the list of years that exists on courses in the db */
export const getYearsAvailable = (() => {
	const stmt = coursesDB
		.prepare<[], string>("SELECT value from metadata where key = 'available_years'")
		.pluck();
	return () => JSON.parse(stmt.get()!) as number[];
})();

/** Retrieves the semesters that exists for a given year in the db */
export const getSemestersAvailable = (() => {
	const stmt = coursesDB
		.prepare<number, string>(
			"SELECT json_extract(value, '$.\"' || ? || '\"') AS semesters\
		  FROM metadata\
		  WHERE key = 'semesters'"
		)
		.pluck();
	return (year: number) => JSON.parse(stmt.get(year) || '[]') as string[];
})();

/** Retrieves an object that maps between existing years to list of semesters in them */
export const getYearSemesterMap = (() => {
	const stmt = coursesDB
		.prepare<[], string>("SELECT value from metadata where key = 'semesters'")
		.pluck();
	return () => JSON.parse(stmt.get()!) as Record<string, string[]>;
})();

/** Retrieves full course by id and year */
export const getFullCourse = (() => {
	return (id: number | string, year: number): YearlyCourse | undefined => {
		const strippedCourse = getCourse(id, year);
		if (strippedCourse === undefined) return;

		const instances: YearlyCourseInstance[] = getCourseInstances(id as number, year).map(
			(instance) => {
				const sessions = getInstancesSessions(instance.instance_id);
				const exams = getInstancesExams(instance.instance_id);
				return { ...instance, sessions, exams };
			}
		);

		return { ...strippedCourse, instances };
	};
})();

/** Retrieves full course by id and year, filtering instances by sessions of the provided semester */
export const getFullCourseSemester = (() => {
	return (id: number, year: number, semester: string): SemesterCourse | undefined => {
		const strippedCourse = getCourse(id, year);
		if (strippedCourse === undefined) return;

		const instances: SemesterCourseInstance[] = getNonEmptyCourseInstances({
			course_id: id,
			year,
			semester,
		}).map((instance) => {
			const sessions = getInstancesSemesterSessions(instance.instance_id, semester);
			const exams = getInstancesExams(instance.instance_id);
			return { ...instance, sessions, exams };
		});

		return { ...strippedCourse, instances };
	};
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

import type { Institute } from '$lib/utils/constants.utils';
import Database from 'better-sqlite3';
import type { Statement, Database as SQLiteDatabase } from 'better-sqlite3';

function makeDB(dbName: string) {
	// Since we only ever read AND are the only reader from db,
	// this are some optimizations to increase read speed
	const db = new Database(`data/${dbName}.sqlite`, {
		readonly: true,
		fileMustExist: true,
	});
	db.pragma('journal_mode = OFF');
	db.pragma('synchronous = OFF');
	return db;
}

const courseDBS = {
	braude: makeDB('braude'),
	ono: makeDB('ono'),
} as const satisfies Record<Institute, SQLiteDatabase>;

// Theses should not be changed or messed with
Object.freeze(courseDBS);

function makeStmts<BindParameters extends unknown[] | {} = unknown[], Result = unknown>(
	query: string,
	stmtMod?: (stmt: Statement) => Statement
) {
	return Object.fromEntries(
		Object.entries(courseDBS).map(([institute, db]) => {
			const stmt = db.prepare<BindParameters, Result>(query);
			if (stmtMod) stmtMod(stmt);
			return [institute, stmt];
		})
	) as Record<Institute, Statement<BindParameters, Result>>;
}

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
	const stmts = makeStmts<[], StrippedCourse>('SELECT * FROM courses ORDER by name');
	return (institute: Institute) => stmts[institute].all();
})();

/** Retrieves one stripped course by id and year */
export const getCourse = (() => {
	const stmts = makeStmts<[number | string, number], StrippedCourse>(
		'SELECT * from courses WHERE course_id = ? and year = ?'
	);
	return (institute: Institute, id: number | string, year: number) =>
		stmts[institute].get(id, year);
})();

/** Check if a course exists in the db */
export const checkCourse = (() => {
	const stmts = makeStmts<[number, number], boolean>(
		'SELECT EXISTS(SELECT 1 FROM courses WHERE course_id = ? and year = ?)'
	);
	return (institute: Institute, id: number | string, year: number) =>
		Boolean(stmts[institute].get(id as number, year));
})();

/** Search all the courses that have sessions for a query*/
export const queryNonEmptyCourses = (() => {
	type Args = {
		year: number;
		semester: string;
		query: string;
	};

	const stmts = makeStmts<Args, Course>(
		"SELECT distinct c.* from courses c\
		join instances using (course_id, year)\
		join sessions USING (instance_id)\
		WHERE year = :year AND semester = :semester\
		AND name like '%' || :query || '%'\
		LIMIT 5"
	);

	return (institute: Institute, args: Args) => stmts[institute].all(args);
})();

/** Retrieves all the course instances for a given course id */
export const getCourseInstances = (() => {
	const stmts = makeStmts<[number | string, number], DBStrippedCourseInstance>(
		'SELECT * FROM instances WHERE course_id = ? and year = ? order by type'
	);
	return (institute: Institute, id: number | string, year: number) =>
		stmts[institute].all(id, year).map(transformInstance);
})();

/** Retrieves all the course instances for a given course id that have sessions */
export const getNonEmptyCourseInstances = (() => {
	type Args = {
		course_id: number;
		year: number;
		semester: string;
	};
	const stmts = makeStmts<Args, DBStrippedCourseInstance>(
		'SELECT distinct c.* from instances c\
		 JOIN sessions USING (instance_id)\
		 WHERE course_id = :course_id AND year = :year AND semester = :semester\
		 order by type'
	);
	return (institute: Institute, args: Args) => stmts[institute].all(args).map(transformInstance);
})();

/** Retrieves all the instance session for a given course instance id for one semester */
export const getInstancesSemesterSessions = (() => {
	const stmts = makeStmts<[number, string], SemesterSession>(
		'SELECT * from sessions where instance_id = ? and semester = ?'
	);
	return (institute: Institute, id: number | string, semester: string) =>
		stmts[institute].all(id as number, semester);
})();

/** Retrieves all the instance session for a given course instance id across all semesters */
export const getInstancesSessions = (() => {
	const stmts = makeStmts<number, YearlySession>('SELECT * from sessions where instance_id = ?');
	return (institute: Institute, id: number | string) => stmts[institute].all(id as number);
})();

/** Retrieves all the exams for a given course instance id */
export const getInstancesExams = (() => {
	const stmts = makeStmts<number, Exam>('SELECT * from exams WHERE instance_id = ?');
	return (institute: Institute, id: number | string) => stmts[institute].all(id as number);
})();

/** Retrieves the list of years that exists on courses in the db */
export const getYearsAvailable = (() => {
	const stmts = makeStmts<[], string>(
		"SELECT value from metadata where key = 'available_years'",
		(s) => s.pluck()
	);

	return (institute: Institute) => JSON.parse(stmts[institute].get()!) as number[];
})();

/** Retrieves the time span list from the db metadata section */
export const getTimeSpans = (() => {
	const stmts = makeStmts<[], string>("SELECT value from metadata where key = 'time_spans'", (s) =>
		s.pluck()
	);

	return (institute: Institute) => JSON.parse(stmts[institute].get()!) as Span[];
})();

/** Retrieves the hours list from the db metadata section */
export const getHoursList = (() => {
	const stmts = makeStmts<[], string>(
		"WITH spans AS (\
			  SELECT json_each.value AS span\
			  FROM metadata m, json_each(m.value, '$') \
			  WHERE m.key = 'time_spans'\
			)\
			SELECT json_extract(span, '$[0]') AS time\
			FROM spans\
			UNION\
			SELECT json_extract(span, '$[1]') AS time\
			FROM spans\
			ORDER BY time;",
		(s) => s.pluck()
	);

	return (institute: Institute) => stmts[institute].all();
})();

/** Retrieves the semesters that exists for a given year in the db */
export const getSemestersAvailable = (() => {
	const stmts = makeStmts<number, string>(
		"SELECT json_extract(value, '$.\"' || ? || '\"') AS semesters\
		  FROM metadata\
		  WHERE key = 'semesters'",
		(s) => s.pluck()
	);

	return (institute: Institute, year: number) =>
		JSON.parse(stmts[institute].get(year) || '[]') as string[];
})();

/** Retrieves an object that maps between existing years to list of semesters in them */
export const getYearSemesterMap = (() => {
	const stmts = makeStmts<[], string>("SELECT value from metadata where key = 'semesters'", (s) =>
		s.pluck()
	);
	return (institute: Institute) => JSON.parse(stmts[institute].get()!) as Record<string, string[]>;
})();

/** Retrieves full course by id and year */
export const getFullCourse = (() => {
	return (institute: Institute, id: number | string, year: number): YearlyCourse | undefined => {
		const strippedCourse = getCourse(institute, id, year);
		if (strippedCourse === undefined) return;

		const instances: YearlyCourseInstance[] = getCourseInstances(institute, id as number, year).map(
			(instance) => {
				const sessions = getInstancesSessions(institute, instance.instance_id);
				const exams = getInstancesExams(institute, instance.instance_id);
				return { ...instance, sessions, exams };
			}
		);

		return { ...strippedCourse, instances };
	};
})();

/** Retrieves full course by id and year, filtering instances by sessions of the provided semester */
export const getFullCourseSemester = (() => {
	return (
		institute: Institute,
		id: number,
		year: number,
		semester: string
	): SemesterCourse | undefined => {
		const strippedCourse = getCourse(institute, id, year);
		if (strippedCourse === undefined) return;

		const instances: SemesterCourseInstance[] = getNonEmptyCourseInstances(institute, {
			course_id: id,
			year,
			semester,
		}).map((instance) => {
			const sessions = getInstancesSemesterSessions(institute, instance.instance_id, semester);
			const exams = getInstancesExams(institute, instance.instance_id);
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

	const stmts = makeStmts<Args, EmptyRoom>(
		"SELECT * FROM empty_rooms\
			 WHERE year = :year\
			 AND semester = :semester\
			 AND week_day = :week_day\
			 AND room != ''"
	);
	return (institute: Institute, args: Args) => stmts[institute].all(args);
})();

/** Retrieves empty rooms by year, semester, week day and start_time */
export const getEmptyRoomsByStart = (() => {
	type Args = {
		year: number;
		semester: string;
		week_day: string;
		start_time: string;
	};

	const stmts = makeStmts<Args, EmptyRoom>(
		"SELECT * FROM empty_rooms\
			 WHERE year = :year\
			 AND semester = :semester\
			 AND week_day = :week_day\
			 AND start_time = :start_time\
			 AND room != ''"
	);
	return (institute: Institute, args: Args) => stmts[institute].all(args);
})();

/** Retrieves room empty sessions by year and semester */
export const getEmptyRoomsByRoom = (() => {
	type Args = {
		year: number;
		semester: string;
		room: string;
	};

	const stmts = makeStmts<Args, EmptyRoom>(
		'SELECT * FROM empty_rooms\
			 WHERE year = :year\
			 AND semester = :semester\
			 AND room = :room'
	);
	return (institute: Institute, args: Args) => stmts[institute].all(args);
})();

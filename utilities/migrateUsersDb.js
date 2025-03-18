import Database from 'better-sqlite3';
import { copyFileSync } from 'fs';
import { argv, exit } from 'process';

const USERS_DB_PATH = './data/users.db';
const COURSES_DB_PATH = './data/courses.db';
if (!argv[2]) exit();
copyFileSync(argv[2], USERS_DB_PATH);
const db = new Database(USERS_DB_PATH);
const coursesDB = new Database(COURSES_DB_PATH);

const getInstance = coursesDB.prepare(
	`SELECT * from course_instances
WHERE
course_id = :course_id AND
instructor = :instructor AND
type = :type AND
year = :year AND
hours = :hours AND
group_name = :group_name AND
is_full = :is_full AND
waiting_list = :waiting_list AND
studied_online = :studied_online AND
faculty = :faculty AND
attendance_mandatory = :attendance_mandatory AND
has_lab = :has_lab AND
language = :language AND
extra_notes = :extra_notes AND
co_requirements = :co_requirements`
);

const getExam = coursesDB.prepare(
	`select * from exams
where
course_instance_id = :course_instance_id and
exam_round = :exam_round and
course_type = :course_type and
date = :date and
exam_type = :exam_type`
);

const getSession = coursesDB.prepare(
	`select * from sessions
where
course_instance_id = :course_instance_id and
semester = :semester and
week_day = :week_day and
start_time = :start_time and
end_time = :end_time and
room = :room`
);

const rows = db.prepare("SELECT * from saved_timetable_data WHERE data_type = 'courses'").all();
db.exec("DELETE FROM saved_timetable_data WHERE data_type = 'courses'");

const insertData = db.prepare(
	'insert into saved_timetable_data (user_id, year, semester, data_type, data)\
     values (:user_id, :year, :semester, :data_type, :data)'
);

for (const row of rows) {
	const { data, data_type, ...otherColumns } = row;
	const courses = [];
	const all_instances = [];
	const active_instance_ids = [];
	for (const { instances, ...course } of JSON.parse(data)) {
		course.last_modified = '1999-12-23 00:00:00'; // use old date so the site will update everything
		courses.push(course);
		instance_loop: for (const { selected, ...instance } of instances) {
			if (selected) {
				active_instance_ids.push(instance.course_instance_id);
			}
			const db_instance = getInstance.get(transformToSqlFriendly(instance));
			if (db_instance) {
				db_instance.exams = [];
				db_instance.sessions = [];
				for (const exam of instance.exams) {
					const db_exam = getExam.get(exam);
					if (db_exam) {
						db_instance.exams.push(db_exam);
					} else {
						instance.full_instance_hash = instance.course_instance_id.toString();
						all_instances.push(instance);
						continue instance_loop;
					}
				}
				for (const session of instance.sessions) {
					const db_session = getSession.get(session);
					if (db_session) {
						db_instance.sessions.push(db_session);
					} else {
						instance.full_instance_hash = instance.course_instance_id.toString();
						all_instances.push(instance);
						continue instance_loop;
					}
				}
				all_instances.push(db_instance);
				console.log(otherColumns);
			} else {
				instance.full_instance_hash = instance.course_instance_id.toString();
				all_instances.push(instance);
			}
		}
	}
	insertData.run({ ...otherColumns, data_type: 'courses', data: JSON.stringify(courses) });
	insertData.run({ ...otherColumns, data_type: 'instances', data: JSON.stringify(all_instances) });
	insertData.run({
		...otherColumns,
		data_type: 'active_instance_ids',
		data: JSON.stringify(active_instance_ids),
	});
}

db.close();

/**
 * Transforms a value into a SQL-friendly format.
 *
 * @template T
 * @param {T} value - The value to transform.
 * @returns {TransformToSqlFriendly<T>} The transformed value.
 */
function transformToSqlFriendly(value) {
	switch (typeof value) {
		case 'boolean':
			// @ts-ignore
			return Number(value);

		case 'function':
			throw new Error('tried inserting function to DB');

		case 'symbol':
			throw new Error('tried inserting symbol to DB');

		case 'object':
			if (Array.isArray(value))
				// @ts-ignore
				return JSON.stringify(value);
			else if (value === null || value === undefined) return value;
			const transformedValue = { ...value };
			for (const key in value) {
				// @ts-ignore
				transformedValue[key] = transformToSqlFriendly(transformedValue[key]);
			}
			// @ts-ignore
			return transformedValue;

		default:
			// @ts-ignore
			return value;
	}
}

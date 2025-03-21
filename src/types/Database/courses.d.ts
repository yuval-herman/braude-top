type PossibleHours = [
	{ hour: 8; min: 30 },
	{ hour: 9; min: 30 },
	{ hour: 10; min: 30 },
	{ hour: 11; min: 30 },
	{ hour: 12; min: 20 },
	{ hour: 12; min: 50 },
	{ hour: 13; min: 50 },
	{ hour: 14; min: 50 },
	{ hour: 15; min: 50 },
	{ hour: 16; min: 50 },
	{ hour: 17; min: 50 },
	{ hour: 18; min: 50 },
	{ hour: 19; min: 50 },
	{ hour: 20; min: 50 },
	{ hour: 21; min: 50 },
	{ hour: 22; min: 50 },
];

type TimeString<TTime extends number = number> =
	`${PossibleHours[TTime]['hour']}:${PossibleHours[TTime]['min']}`;

type test = TimeString[0] extends '8:30' ? true : false;

interface CourseSession {
	course_instance_id: number;
	semester: string;
	week_day: string;
	start_time: TimeString;
	end_time: TimeString;
	room: string;
	last_modified: string;
}

interface EmptyRoom {
	year: number;
	semester: string;
	week_day: string;
	start_time: TimeString;
	end_time: TimeString;
	room: string;
	last_modified: string;
}

interface CourseExam {
	course_instance_id: number;
	exam_round: number;
	course_type: string;
	date: string;
	exam_type?:
		| 'בחינה רגילה'
		| 'בחינה במעבדה'
		| 'ללא בחינה - עבודה, פרוייקט,דוח'
		| 'מבחן בית'
		| 'ללא השגחה'
		| 'בחינה מפוצלת';
	last_modified: string;
}

interface CourseInstance {
	course_id: number;
	course_instance_id: number;
	type: string;
	year: number;
	hours: number;
	group_name: string;
	is_full: number;
	waiting_list: boolean;
	studied_online: boolean;
	faculty: string[];
	attendance_mandatory: boolean;
	has_lab: boolean;
	language: string | null;
	extra_notes: string | null;
	instructor: string;
	co_requirements: string | null;
	last_modified: string;
	full_instance_hash: string;
}

interface Course {
	course_id: number;
	name: string;
	year: number;
	credit: number;
	description: string;
	syllabus_link: string | null;
	last_modified: string;
}

type FullCourseInstance = CourseInstance & {
	sessions: CourseSession[];
	exams: CourseExam[];
};
type FullCourse = Course & { instances: FullCourseInstance[] };

type CourseIdentifier = { course_id: number; year: number; last_modified: string };

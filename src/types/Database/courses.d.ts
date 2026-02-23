type StrippedCourse = {
	course_id: number;
	name: string;
	year: number;
	description?: string;
};

type StrippedCourseInstance = {
	year: number;
	course_id: number;
	instance_id: string;
	instructor: string;
	type: string;
	hours: number;
	group_name: string;
	syllabus_link?: string;
	language?: string;
	credit: number;
	pre_requirements?: PreRequirements[];
	co_requirement_instance_ids?: string[];
	// is_full: boolean;
	// waiting_list: boolean;
	// studied_online: boolean;
	// faculty: string[];
	// attendance_mandatory: boolean;
	// has_lab: boolean;
};

/** A `Slot` represents any time span that is not necessarily associated with a room or other specific event*/
type Slot = {
	semester: string;
	week_day: string;
	start_time: string;
	end_time: string;
};

/** A `Span` represents a simple time span with a start and end time as an array */
type Span = [string, string];

type Session = Slot & {
	room: string;
	instance_id: string;
};

type EmptyRoom = Slot & {
	year: number;
	room: string;
};

type CourseInstance = StrippedCourseInstance & { sessions: Session[]; exams: Exam[] };

type Course = StrippedCourse & {
	instances: CourseInstance[];
};

type Exam = {
	exam_round: number;
	course_type: string;
	date: string;
	exam_type?: string;
};

type PreRequirements = {
	major: string;
	options: string[];
};

export interface Item {
	day: number; // Day of the week 1-6
	start: number; // Start hour as an integer (1=8:30, 2=9:30, etc...)
	end: number; // End hour as an integer
	value: {
		room: string;
		instructor: string;
		name: string;
	}; // Value to show in cell
}

export interface CourseInstance {
	course_id: number;
	course_instance_id: number;
	type: string;
	hours: number;
	group_name: string;
	is_full: number;
	language: string;
	extra_notes?: string;
	instructor: string;
}

export interface Session {
	course_instance_id: number;
	semester: string;
	week_day: string;
	start_time: string;
	end_time: string;
	room: string;
}

export interface Course {
	course_id: number;
	name: string;
	year: string;
	credit: number;
	description: string;
	syllabus_link: string;
}

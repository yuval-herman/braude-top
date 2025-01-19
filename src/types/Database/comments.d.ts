interface UserComment {
	id: number;
	course_id: number;
	course_year: number;
	user_id: number | bigint;
	content: string;
	created_at: string;
	updated_at?: string;
	is_flagged: boolean;
	is_anon: boolean;
}

import {
	getCommentsByCourse,
	getUserCommentsByCourse,
	insertComment,
} from '$lib/server/commentsDB.js';
import {
	checkCourse,
	getFullCourse,
	getSemestersAvailable,
	getYearsAvailable,
} from '$lib/server/coursesDB';
import { getUser } from '$lib/server/usersDB.js';
import { getYearSemester } from '$lib/utils/utils.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, setHeaders, url, parent, depends, locals }) => {
	depends('new-comment');
	const { year } = getYearSemester(url, (await parent()).availableTimeSpans);
	const course = getFullCourse(params.course_id, year);

	if (course === undefined) {
		error(404, 'הקורס לא נמצא');
	}

	const comments = getCommentsByCourse(course.course_id, course.year);

	setHeaders({ 'cache-control': 'max-age=3600' });
	return {
		course,
		user_has_comment: locals.user && comments.some((c) => c.user_id === locals.user!.id),
		comments: comments.map(({ content, created_at, id, is_anon, updated_at, user_id }) => {
			return {
				content,
				created_at,
				updated_at,
				id,
				poster_name: is_anon ? undefined : (getUser(user_id)?.name ?? 'משתמש נמחק מהמערכת'),
			};
		}),
	};
};

export const actions = {
	'add-comment': async ({ request, locals, params, url }) => {
		const { year } = getYearSemester(
			url,
			getYearsAvailable().map((y) => ({
				year: y,
				semesters: getSemestersAvailable(y),
			}))
		);
		if (!checkCourse(params.course_id, year)) error(400, 'לא ניתן להגיב על קורס שאינו קיים');
		const { user } = locals;
		if (!user) error(401, 'כדי להגיב חובה להתחבר');
		if (
			getUserCommentsByCourse({
				course_id: Number(params.course_id),
				course_year: year,
				user_id: user.id,
			}).length
		)
			error(400, 'ניתן לשלוח תגובה אחת בלבד לכל קורס');

		const formData = await request.formData();
		const content = formData.get('content');
		if (!content) error(400, 'לא ניתן להוסיף תגובה ריקה');
		else if (typeof content !== 'string') error(400, 'תגובה לא מורכבת מטקסט');
		const is_anon = Boolean(formData.get('anonymous'));

		insertComment({
			content,
			is_anon,
			course_id: Number(params.course_id),
			course_year: year,
			user_id: user.id,
		});
		return { success: true };
	},
};

/**
 * after sending comment, user can only update comment, not send another one
 */

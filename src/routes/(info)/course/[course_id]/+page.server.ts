import {
	getCommentsByCourse,
	getUserCommentsByCourse,
	insertComment,
	updateComment,
} from '$lib/server/commentsDB.js';
import {
	checkCourse,
	getFullCourse,
	getSemestersAvailable,
	getYearsAvailable,
} from '$lib/server/coursesDB';
import { getUser } from '$lib/server/usersDB.js';
import { resolveYearSemester } from '$lib/utils/utils.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, setHeaders, parent, locals }) => {
	const { year } = await parent();
	const course = getFullCourse(params.course_id, year);

	if (course === undefined) {
		error(404, 'הקורס לא נמצא');
	}

	const comments = getCommentsByCourse(course.course_id, course.year);

	setHeaders({ 'cache-control': 'max-age=3600' });
	return {
		course,
		user_previous_comment: locals.user && comments.find((c) => c.user_id === locals.user!.id),
		comments: comments.map(({ content, created_at, id, is_anon, updated_at, user_id, rating }) => {
			return {
				content,
				created_at,
				updated_at,
				id,
				rating,
				poster_name: is_anon ? undefined : (getUser(user_id)?.name ?? 'משתמש נמחק מהמערכת'),
			};
		}),
	};
};

export const actions = {
	'add-comment': async ({ request, locals, params, url, cookies }) => {
		const { year } = resolveYearSemester(
			url,
			{ year: cookies.get('year'), semester: cookies.get('semester') },
			getYearsAvailable().map((y) => ({
				year: y,
				semesters: getSemestersAvailable(y),
			}))
		);
		if (!checkCourse(params.course_id, year)) error(400, 'לא ניתן להגיב על קורס שאינו קיים');
		const { user } = locals;
		if (!user) error(401, 'כדי להגיב חובה להתחבר');

		const formData = await request.formData();
		const content = formData.get('content');
		if (!content) error(400, 'לא ניתן להוסיף תגובה ריקה');
		else if (typeof content !== 'string') error(400, 'תגובה לא מורכבת מטקסט');
		const is_anon = Boolean(formData.get('anonymous'));
		const stars = Number(formData.get('stars'));
		if (isNaN(stars)) error(400, 'דירוג חייב להיות מספר');
		else if (stars > 5 || stars < 0) error(400, 'דירוג חייב להיות מספר בין 0 ל-5');

		const rating = stars || undefined; // set to null if 0
		const comment_id: number | undefined = getUserCommentsByCourse({
			course_id: Number(params.course_id),
			course_year: year,
			user_id: user.id,
		})[0]?.id;

		if (comment_id) {
			updateComment({ id: comment_id, content, is_anon, rating });
		} else {
			insertComment({
				content,
				rating,
				is_anon,
				course_id: Number(params.course_id),
				course_year: year,
				user_id: user.id,
			});
		}
		return { success: true };
	},
};

/**
 * after sending comment, user can only update comment, not send another one
 */

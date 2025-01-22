import { upsertSavedTimetable } from '$lib/server/usersDB.js';
import { error } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
	if (!locals.user) return error(401, 'משתמש לא מחובר');
	const data = await request.json();

	if (
		typeof data.year !== 'number' ||
		typeof data.semester !== 'string' ||
		!Array.isArray(data.timetable)
	)
		error(400);

	upsertSavedTimetable({
		user_id: locals.user.id,
		year: data.year,
		semester: data.semester,
		saved_timetable: data.timetable,
	});
	return new Response();
};

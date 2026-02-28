import { upsertSavedTimetableData } from '$lib/server/usersDB.js';
import { error } from '@sveltejs/kit';

const allowedTypes = ['rooms', 'courses', 'instances', 'active_instance_ids'];

export const POST = async ({ request, locals }) => {
	if (!locals.user) error(401, 'משתמש לא מחובר');
	const data = await request.json();

	if (
		typeof data.year !== 'number' ||
		typeof data.semester !== 'string' ||
		!allowedTypes.includes(data.data_type)
	)
		error(400);

	upsertSavedTimetableData({
		user_id: locals.user.id,
		year: data.year,
		semester: data.semester,
		data_type: data.data_type,
		data: data.data,
	});

	return new Response();
};

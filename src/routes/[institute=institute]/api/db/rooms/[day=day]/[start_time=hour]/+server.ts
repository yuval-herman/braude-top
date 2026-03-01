import { getEmptyRoomsByStart } from '$lib/server/coursesDB.js';
import { resolveYearSemester } from '$lib/server/utils.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ url, params, cookies, setHeaders }) => {
	const { year, semester } = resolveYearSemester(params.institute, url, {
		year: cookies.get('year'),
		semester: cookies.get('semester'),
	});
	const rooms = getEmptyRoomsByStart(params.institute, {
		year,
		semester,
		week_day: params.day,
		start_time: params.start_time,
	});

	setHeaders({ 'cache-control': 'max-age=3600' });
	return json(rooms);
};

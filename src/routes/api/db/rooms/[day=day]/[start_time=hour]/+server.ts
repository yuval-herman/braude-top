import {
	getEmptyRoomsByStart,
	getSemestersAvailable,
	getYearsAvailable,
} from '$lib/server/coursesDB.js';
import { resolveYearSemester } from '$lib/utils/utils.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ url, params, cookies, setHeaders }) => {
	const { year, semester } = resolveYearSemester(
		url,
		{ year: cookies.get('year'), semester: cookies.get('semester') },
		getYearsAvailable().map((y) => ({
			year: y,
			semesters: getSemestersAvailable(y),
		}))
	);
	const rooms = getEmptyRoomsByStart({
		year,
		semester,
		week_day: params.day,
		start_time: params.start_time,
	});

	setHeaders({ 'cache-control': 'max-age=3600' });
	return json(rooms);
};

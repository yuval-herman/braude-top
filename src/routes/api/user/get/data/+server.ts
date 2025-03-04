import { getSemestersAvailable } from '$lib/server/coursesDB';
import { getYearsAvailable } from '$lib/server/coursesDB';
import { getUserSavedTimetableData } from '$lib/server/usersDB';
import { resolveYearSemester } from '$lib/utils/utils';
import { error, json } from '@sveltejs/kit';

export const GET = async ({ locals, cookies, url }) => {
	if (!locals.user) error(401, 'משתמש לא מחובר');
	const url_data_types = url.searchParams.get('data_types') ?? undefined;
	const data_types = url_data_types ? (JSON.parse(url_data_types) as SavedDataTypes[]) : undefined;

	const availableTimeSpans = getYearsAvailable().map((y) => ({
		year: y,
		semesters: getSemestersAvailable(y),
	}));

	const { year, semester } = resolveYearSemester(
		url,
		{ year: cookies.get('year'), semester: cookies.get('semester') },
		availableTimeSpans
	);

	return json(getUserSavedTimetableData({ user_id: locals.user.id, year, semester, data_types }));
};

import { getUserSavedTimetableData } from '$lib/server/usersDB';
import { resolveYearSemester } from '$lib/server/utils';
import { error, json } from '@sveltejs/kit';

export const GET = async ({ locals, cookies, url }) => {
	if (!locals.user) error(401, 'משתמש לא מחובר');
	const url_data_types = url.searchParams.get('data_types') ?? undefined;
	const data_types = url_data_types ? (JSON.parse(url_data_types) as SavedDataTypes[]) : undefined;

	// Getting this from cookies here is insane design. Shame on you :( @fix!
	const { year, semester } = resolveYearSemester(url, {
		year: cookies.get('year'),
		semester: cookies.get('semester'),
	});

	return json(getUserSavedTimetableData({ user_id: locals.user.id, year, semester, data_types }));
};

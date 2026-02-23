import { getYearSemesterMap } from '$lib/server/coursesDB';
import { getUserSavedTimetableData, getUserSettings } from '$lib/server/usersDB.js';
import { resolveYearSemester } from '$lib/server/utils.js';

export const load = async ({ cookies, locals, url }) => {
	let settings, savedTimetableData;
	const availableTimeSpans = Object.entries(getYearSemesterMap());
	const { year, semester } = resolveYearSemester(url, {
		year: cookies.get('year'),
		semester: cookies.get('semester'),
	});

	if (locals.user) {
		settings = getUserSettings(locals.user.id);
		savedTimetableData = getUserSavedTimetableData({ user_id: locals.user.id, year, semester });
	}

	let themeCookie = cookies.get('theme') ?? 'auto';

	return {
		themeCookie,
		availableTimeSpans,
		user: locals.user,
		settings,
		savedTimetableData,
		year,
		semester,
	};
};

export const prerender = false;

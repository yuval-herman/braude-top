import { getYearSemesterMap } from '$lib/server/coursesDB';
import { getUserSavedTimetableData, getUserSettings } from '$lib/server/usersDB.js';
import { resolveYearSemester } from '$lib/server/utils.js';

export const load = async ({ cookies, locals, url, params }) => {
	let settings, savedTimetableData;
	const availableTimeSpans = Object.entries(getYearSemesterMap('braude'));
	const { year, semester } = resolveYearSemester(params.institute, url, {
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
		institute: params.institute,
	};
};

export const prerender = false;

import { getSemestersAvailable, getYearsAvailable } from '$lib/server/coursesDB';
import { getUserSavedTimetables, getUserSettings } from '$lib/server/usersDB.js';
import { getYearSemester } from '$lib/utils/utils.js';

export const load = async ({ cookies, locals, url }) => {
	let settings, savedTimetable;
	const availableTimeSpans = getYearsAvailable().map((y) => ({
		year: y,
		semesters: getSemestersAvailable(y),
	}));

	const { year, semester } = getYearSemester(url, availableTimeSpans);

	let themeCookie = cookies.get('theme') ?? 'auto';

	if (locals.user) {
		settings = getUserSettings(locals.user.id);
		savedTimetable = getUserSavedTimetables({ user_id: locals.user.id, year, semester });
	}
	return { themeCookie, availableTimeSpans, user: locals.user, settings, savedTimetable };
};

export const ssr = true;

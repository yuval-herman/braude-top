import { getSemestersAvailable, getYearsAvailable } from '$lib/server/coursesDB';
import { getUserSavedTimetableData, getUserSettings } from '$lib/server/usersDB.js';
import { getYearSemester } from '$lib/utils/utils.js';

export const load = async ({ cookies, locals, url }) => {
	let settings, savedTimetableData;
	const availableTimeSpans = getYearsAvailable().map((y) => ({
		year: y,
		semesters: getSemestersAvailable(y),
	}));

	const { year, semester } = getYearSemester(url, availableTimeSpans);

	let themeCookie = cookies.get('theme') ?? 'auto';

	if (locals.user) {
		settings = getUserSettings(locals.user.id);
		savedTimetableData = getUserSavedTimetableData({ user_id: locals.user.id, year, semester });
	}

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

export const ssr = true;

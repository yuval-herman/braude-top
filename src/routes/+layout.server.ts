import { getSemestersAvailable, getYearsAvailable } from '$lib/server/coursesDB';
import { getUserSavedTimetableData, getUserSettings } from '$lib/server/usersDB.js';
import { resolveYearSemester } from '$lib/utils/utils.js';

export const load = async ({ cookies, locals, url }) => {
	let settings, savedTimetableData;
	const availableTimeSpans = getYearsAvailable().map((y) => ({
		year: y,
		semesters: getSemestersAvailable(y),
	}));
	let year: number | undefined = undefined,
		semester: string | undefined = undefined;
	while (year === undefined || semester === undefined) {
		try {
			({ year, semester } = resolveYearSemester(
				url,
				{ year: cookies.get('year'), semester: cookies.get('semester') },
				availableTimeSpans
			));
		} catch {
			// we try our best to not let this function fail because if it does the site won't load
			availableTimeSpans.shift();
			if (availableTimeSpans.length === 0) {
				throw new Error('לא נמצאו תקופות זמנים זמינות');
			}
		}
	}

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

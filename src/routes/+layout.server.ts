import { getSemestersAvailable, getYearsAvailable } from '$lib/server/coursesDB';
import { getUserSettings } from '$lib/server/usersDB.js';

export const load = async ({ cookies, locals }) => {
	let settings;
	if (locals.user) settings = getUserSettings(locals.user?.id);
	const availableTimeSpans = getYearsAvailable().map((y) => ({
		year: y,
		semesters: getSemestersAvailable(y),
	}));

	let themeCookie = cookies.get('theme') ?? 'auto';

	return { themeCookie, availableTimeSpans, user: locals.user, settings };
};

export const ssr = true;

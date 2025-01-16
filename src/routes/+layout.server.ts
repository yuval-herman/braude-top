import { getSemestersAvailable, getYearsAvailable } from '$lib/server/coursesDB';

export const load = async ({ cookies, locals }) => {
	const availableTimeSpans = getYearsAvailable().map((y) => ({
		year: y,
		semesters: getSemestersAvailable(y),
	}));

	let themeCookie = cookies.get('theme') ?? 'auto';

	return { themeCookie, availableTimeSpans, user: locals.user };
};

export const ssr = true;

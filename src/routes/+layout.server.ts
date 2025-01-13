import { getSemestersAvailable, getYearsAvailable } from '$lib/server/coursesDB';

export const load = async ({ cookies }) => {
	const availableTimeSpans = getYearsAvailable().map((y) => ({
		year: y,
		semesters: getSemestersAvailable(y),
	}));

	let themeCookie = cookies.get('theme') ?? 'auto';

	return { themeCookie, availableTimeSpans };
};

export const ssr = true;

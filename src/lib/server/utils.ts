import { getYearSemesterMap } from '$lib/server/coursesDB';
import { error } from '@sveltejs/kit';

/**
 * Resolved the selected year and semester from url search params or cookies.
 * Url search params has precedence over cookies.
 */
export function resolveYearSemester(
	url: URL,
	currentCookies: { year?: string; semester?: string }
) {
	let year: number = Number(url.searchParams.get('year') ?? currentCookies.year);
	let semester: string | undefined = url.searchParams.get('semester') ?? currentCookies.semester;

	const available = Object.entries(getYearSemesterMap())
		.map(([year, semesters]) => ({ year: +year, semesters }))
		.sort((a, b) => a.year - b.year);
	if (!year || !semester) {
		year ||= available[0].year;
		semester ||= available.find((i) => i.year === year)?.semesters[0];
	}

	if (!semester) {
		error(404, `לא נמצא סמסטר לשנת ${year}`);
	} else if (!available.some((span) => span.year === year)) {
		error(404, `שנת ${year} לא נמצאה`);
	} else if (
		!available.some((span) => span.year === year && span.semesters.some((s) => s === semester))
	) {
		error(404, `סמסטר ${semester} לא נמצא לשנת ${year}`);
	}

	return { year, semester };
}

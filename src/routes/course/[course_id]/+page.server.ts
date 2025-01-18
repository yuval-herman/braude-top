import { getFullCourse } from '$lib/server/coursesDB';
import { getYearSemester } from '$lib/utils/utils.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, setHeaders, url, parent }) => {
	const { year } = getYearSemester(url, (await parent()).availableTimeSpans);
	const course = getFullCourse(params.course_id, year);

	if (course === undefined) {
		error(404, 'הקורס לא נמצא');
	}

	setHeaders({ 'cache-control': 'max-age=3600' });
	return { course };
};

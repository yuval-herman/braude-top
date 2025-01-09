import { getFullCourse } from '$lib/server/coursesDB';
import { error } from '@sveltejs/kit';

export const load = async ({ params, setHeaders }) => {
	const course = getFullCourse(params.course_id);

	if (course === undefined) {
		error(404, 'הקורס לא נמצא');
	}

	setHeaders({ 'cache-control': 'max-age=3600' });
	return { course };
};

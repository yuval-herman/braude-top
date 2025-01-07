import { getFullCourse } from '$lib/server/coursesDB';

export const load = async ({ params, setHeaders }) => {
	setHeaders({ 'cache-control': 'max-age=3600' });
	return { course: getFullCourse(params.course_id) };
};

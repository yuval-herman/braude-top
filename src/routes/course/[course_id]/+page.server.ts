import { getFullCourse } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders({ 'cache-control': 'max-age=3600' });
	return { course: getFullCourse(params.course_id) };
};

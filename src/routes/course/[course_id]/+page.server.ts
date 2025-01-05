import { getFullCourse } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params: { course_id } }) => {
	return { course: getFullCourse(course_id) };
};

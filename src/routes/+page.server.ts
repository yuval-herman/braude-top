import { getCourseInstances, getCoursesMinimal } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { courses: getCoursesMinimal() };
};

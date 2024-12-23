import { getCourseInstances, getCourses, getInstancesSession } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const full_courses = getCourses().map((course) => ({
		...course,
		instances: getCourseInstances(course.course_id).map((instance) => ({
			...instance,
			sessions: getInstancesSession(instance.course_instance_id)
		}))
	}));
	return { full_courses };
};

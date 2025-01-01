import {
	getInstancesExams,
	getInstancesSession,
	getNonEmptyCourseInstances,
	getNonEmptyCourses
} from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const full_courses = getNonEmptyCourses().map((course) => ({
		...course,
		instances: getNonEmptyCourseInstances(course.course_id).map((instance) => ({
			...instance,
			sessions: getInstancesSession(instance.course_instance_id),
			exams: getInstancesExams(instance.course_instance_id)
		}))
	}));
	return { full_courses };
};

export const prerender = true;

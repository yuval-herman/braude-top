import {
	getInstancesExams,
	getInstancesSession,
	getNonEmptyCourseInstances,
	getNonEmptyCourses
} from '$lib/server/db';

export const load = async ({ params }) => {
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

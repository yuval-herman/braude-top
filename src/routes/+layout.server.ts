import {
	getInstancesExams,
	getInstancesSession,
	getNonEmptyCourseInstances,
	getNonEmptyCourses
} from '$lib/server/coursesDB';

export const load = async ({ params, cookies }) => {
	const full_courses = getNonEmptyCourses().map((course) => ({
		...course,
		instances: getNonEmptyCourseInstances(course.course_id).map((instance) => ({
			...instance,
			sessions: getInstancesSession(instance.course_instance_id),
			exams: getInstancesExams(instance.course_instance_id)
		}))
	}));
	let themeCookie = cookies.get('theme') ?? 'auto';
	return { full_courses, themeCookie };
};

export const ssr = true;

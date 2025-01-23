import {
	getInstancesExams,
	getInstancesSession,
	getNonEmptyCourseInstances,
	queryNonEmptyCourses,
} from '$lib/server/coursesDB';

export const load = async ({ url, parent }) => {
	let query = url.searchParams.get('query');
	const { year, semester } = await parent();

	const full_courses = query
		? queryNonEmptyCourses({ year, semester, query }).map((course) => ({
				...course,
				instances: getNonEmptyCourseInstances(course.course_id, year).map((instance) => ({
					...instance,
					sessions: getInstancesSession(instance.course_instance_id),
					exams: getInstancesExams(instance.course_instance_id),
				})),
			}))
		: undefined;

	return { full_courses };
};

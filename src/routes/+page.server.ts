import {
	getInstancesExams,
	getInstancesSemesterSessions,
	getInstancesSessions,
	getNonEmptyCourseInstances,
	queryNonEmptyCourses,
} from '$lib/server/coursesDB';

export const load = async ({ url, parent }) => {
	let query = url.searchParams.get('query');
	const { year, semester } = await parent();

	const full_courses = query
		? queryNonEmptyCourses({ year, semester, query }).map((course) => ({
				...course,
				instances: getNonEmptyCourseInstances({ course_id: course.course_id, year, semester }).map(
					(instance) => ({
						...instance,
						sessions: getInstancesSemesterSessions(instance.instance_id, semester),
						exams: getInstancesExams(instance.instance_id),
					})
				),
			}))
		: undefined;

	return { full_courses };
};

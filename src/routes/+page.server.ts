import {
	getInstancesExams,
	getInstancesSession,
	getNonEmptyCourseInstances,
	queryNonEmptyCourses,
} from '$lib/server/coursesDB';
import { getYearSemester } from '$lib/utils.js';
import { error } from '@sveltejs/kit';

export const load = async ({ url, parent }) => {
	let query = url.searchParams.get('query');
	const available = (await parent()).availableTimeSpans;
	const { year, semester } = getYearSemester(url, available);

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

	return { full_courses, year, semester };
};

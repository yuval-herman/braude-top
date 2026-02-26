import {
	getFullCourse,
	getInstancesExams,
	getInstancesSemesterSessions,
	getNonEmptyCourseInstances,
	queryNonEmptyCourses,
} from '$lib/server/coursesDB';

export const load = async ({ url, parent }) => {
	const nameQuery = url.searchParams.get('name-query');
	const idQuery = parseInt(url.searchParams.get('id-query') || '');
	const { year, semester } = await parent();

	const full_courses = nameQuery
		? queryNonEmptyCourses({ year, semester, query: nameQuery })
				.map((course) => ({
					...course,
					instances: getNonEmptyCourseInstances({
						course_id: course.course_id,
						year,
						semester,
					}).map((instance) => ({
						...instance,
						sessions: getInstancesSemesterSessions(instance.instance_id, semester),
						exams: getInstancesExams(instance.instance_id),
					})),
				}))
				// The filter here is to ensure a course does not appear twice if it matches both the id and the name query.
				// The reason I use a filter is so I can also keep the ordering so that the course found by id always appears first.
				.filter((c) => c.course_id !== idQuery)
		: [];

	if (!isNaN(idQuery)) {
		const queriedCourse = getFullCourse(idQuery, year);
		if (queriedCourse) full_courses.unshift(queriedCourse);
	}

	return { full_courses };
};

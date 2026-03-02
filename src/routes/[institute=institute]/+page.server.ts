import {
	getFullCourseSemester,
	getHoursList,
	getInstancesExams,
	getInstancesSemesterSessions,
	getNonEmptyCourseInstances,
	queryNonEmptyCourses,
} from '$lib/server/coursesDB';

export const load = async ({ url, parent, params }) => {
	const nameQuery = url.searchParams.get('name-query');
	const idQuery = parseInt(url.searchParams.get('id-query') || '');
	const { year, semester } = await parent();

	const full_courses: SemesterCourse[] = nameQuery
		? queryNonEmptyCourses(params.institute, { year, semester, query: nameQuery })
				.map((course) => ({
					...course,
					instances: getNonEmptyCourseInstances(params.institute, {
						course_id: course.course_id,
						year,
						semester,
					}).map((instance) => ({
						...instance,
						sessions: getInstancesSemesterSessions(
							params.institute,
							instance.instance_id,
							semester
						),
						exams: getInstancesExams(params.institute, instance.instance_id),
					})),
				}))
				// The filter here is to ensure a course does not appear twice if it matches both the id and the name query.
				// The reason I use a filter is so I can also keep the ordering so that the course found by id always appears first.
				.filter((c) => c.course_id !== idQuery)
		: [];

	if (!isNaN(idQuery)) {
		const queriedCourse = getFullCourseSemester(params.institute, idQuery, year, semester);
		if (queriedCourse) full_courses.unshift(queriedCourse);
	}

	const time_spans = getHoursList(params.institute);

	return { full_courses, time_spans };
};

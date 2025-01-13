import {
	getNonEmptyCourses,
	getNonEmptyCourseInstances,
	getInstancesSession,
	getInstancesExams,
} from '$lib/server/coursesDB';
import { error } from '@sveltejs/kit';

export const load = async ({ url, parent }) => {
	let year: number = Number(url.searchParams.get('year'));
	let semester: string | undefined = url.searchParams.get('semester') ?? undefined;
	const available = (await parent()).availableTimeSpans;

	if (!year || !semester) {
		year ||= available[0].year;
		semester ||= available.find((i) => i.year === year)?.semesters[0];
	}

	if (!semester) {
		error(404, `לא נמצא סמסטר לשנת ${year}`);
	} else if (!available.some((span) => span.year === year)) {
		error(404, `שנת ${year} לא נמצאה`);
	} else if (
		!available.some((span) => span.year === year && span.semesters.some((s) => s === semester))
	) {
		error(404, `סמסטר ${semester} לא נמצא לשנת ${year}`);
	}

	const full_courses = getNonEmptyCourses({ year, semester }).map((course) => ({
		...course,
		instances: getNonEmptyCourseInstances(course.course_id, year).map((instance) => ({
			...instance,
			sessions: getInstancesSession(instance.course_instance_id),
			exams: getInstancesExams(instance.course_instance_id),
		})),
	}));

	return { full_courses };
};

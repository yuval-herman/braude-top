import { getCourseIdentifier, getCourseInstanceHashes } from '$lib/server/coursesDB.js';
import { error, json } from '@sveltejs/kit';

function isCourseIdentifier(CID: unknown): CID is CourseIdentifier {
	if (
		CID &&
		typeof CID === 'object' &&
		'course_id' in CID &&
		typeof CID.course_id === 'number' &&
		'year' in CID &&
		typeof CID.year === 'number' &&
		'last_modified' in CID &&
		typeof CID.last_modified === 'string'
	)
		return true;

	return false;
}

export const POST = async ({ request }) => {
	const { courses, semester } = await request.json();
	if (
		typeof semester !== 'string' ||
		!Array.isArray(courses) ||
		!courses.every((c) => isCourseIdentifier(c))
	) {
		error(400);
	}

	const results = [];

	for (const c of courses) {
		const { course_id, year } = c;
		const courseIdentifier = getCourseIdentifier(course_id, year);
		if (!courseIdentifier) {
			results.push({ course_id, year, exists: false });
		} else {
			results.push({
				...courseIdentifier,
				instance_hashes: getCourseInstanceHashes({ course_id, year, semester }),
				exists: true,
			});
		}
	}

	return json(results);
};

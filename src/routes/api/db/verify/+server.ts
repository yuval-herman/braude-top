// import { checkInstanceHash, getCourse, getCourseLastModified } from '$lib/server/coursesDB.js';
import { error, json } from '@sveltejs/kit';

const availableHashes: string[] = [];

function checkInstanceHash(hash: string) {
	return availableHashes.includes(hash);
}

type CourseIdString = `${number}-${number}`; // `${course_id}-${year}`
function GCID(id: number, year: number): CourseIdString {
	return `${id}-${year}`;
}

const coursesModificationDates = new Map<CourseIdString, Course>();
function getCourseLastModified(id: number, year: number) {
	return coursesModificationDates.get(GCID(id, year))?.last_modified;
}

function getCourse(id: number, year: number) {
	return coursesModificationDates.get(GCID(id, year));
}

export const POST = async ({ request }) => {
	const { courses, instance_hashes } = await request.json();
	if (
		!Array.isArray(courses) ||
		!Array.isArray(instance_hashes) ||
		!courses.every((c) => isCourseIdentifier(c)) ||
		!instance_hashes.every((c) => typeof c === 'string')
	) {
		error(400);
	}

	const modified_courses: Course[] = [];
	const deleted_courses: Pick<Course, 'course_id' | 'year'>[] = [];
	for (const { course_id, year, last_modified } of courses) {
		if (last_modified !== getCourseLastModified(course_id, year)) {
			const course = getCourse(course_id, year);
			if (!course) {
				deleted_courses.push({ course_id, year });
			} else modified_courses.push(course);
		}
	}

	const missing_hashes: string[] = [];
	for (const hash of instance_hashes) {
		if (checkInstanceHash(hash)) continue;
		missing_hashes.push(hash);
	}
	return json({ modified_courses, deleted_courses, missing_hashes });
};

function isCourseIdentifier(
	CID: unknown
): CID is { course_id: number; year: number; last_modified: string } {
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

import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCourseInstances } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
	const { course_id } = params;
	return json(getCourseInstances(course_id));
};

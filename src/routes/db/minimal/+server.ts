import { getCoursesMinimal } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';

export const GET: RequestHandler = async ({}) => {
	return json(getCoursesMinimal());
};

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getInstancesSession } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
	const { instance_id } = params;
	return json(getInstancesSession(instance_id));
};

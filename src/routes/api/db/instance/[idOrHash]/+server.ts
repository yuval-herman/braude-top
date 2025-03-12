import { getFullInstance } from '$lib/server/coursesDB';
import { json } from '@sveltejs/kit';

export const GET = async ({ params }) => {
	const id = Number(params.idOrHash);
	const instance = getFullInstance(isNaN(id) ? params.idOrHash : id);
	return json(instance);
};

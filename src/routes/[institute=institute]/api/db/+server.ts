import { getDBName } from '$lib/server/coursesDB.js';
import { readFileSync } from 'fs';

export const GET = async ({ params }) => {
	const dbName = getDBName(params.institute);
	const file_data = readFileSync('data/' + dbName);
	return new Response(file_data, {
		headers: {
			'Content-Type': 'application/octet-stream',
			// Forces a download with the specified filename
			'Content-Disposition': `attachment; filename="${dbName}"`,
		},
	});
};

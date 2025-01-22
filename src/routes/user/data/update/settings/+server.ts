import { upsertSettings } from '$lib/server/usersDB.js';
import { error } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
	if (!locals.user) return error(401, 'משתמש לא מחובר');
	const data = await request.json();
	if (!validateSettings(data)) error(400);
	upsertSettings({ user_id: locals.user.id, settings: data });
	return new Response();
};

function validateSettings(obj: any): obj is Settings {
	if (typeof obj !== 'object') return false;

	const settings: Required<Settings> = {
		anonymous_comment: false,
		columns_margins: false,
		show_lunch: false,
		show_walk_times: false,
	};

	for (const key in obj) {
		if (!(key in settings && typeof settings[key as keyof Settings] === typeof obj[key]))
			return false;
	}
	return true;
}

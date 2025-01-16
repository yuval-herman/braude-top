import { dev } from '$app/environment';
import { createSession, generateSessionToken } from '$lib/server/auth';
import { deleteContactMessage, getContactMessages } from '$lib/server/contactDB.js';
import { getUser } from '$lib/server/usersDB.js';
import { error } from '@sveltejs/kit';

export const load = async ({ cookies, locals }) => {
	let session = locals.session,
		user = locals.user,
		signedBy = 'cookie';
	if (!user && dev) {
		// redirect to log in
		const userId = 0;
		user = getUser(userId);
		if (!user) {
			error(404);
		}

		// after signed in
		const token = generateSessionToken();
		session = createSession(token, userId);

		cookies.set('session', token, {
			httpOnly: true,
			sameSite: 'lax',
			expires: session.expires_at,
			path: '/',
		});
		signedBy = 'credentials';
	}
	if (!user || user.role !== 'admin') {
		error(404);
	} else {
		return {
			session,
			user,
			signedBy,
			messages: getContactMessages(),
		};
	}
};

export const actions = {
	'delete-message': async ({ request }) => {
		const message_id = Number((await request.formData()).get('id') ?? undefined);
		console.log(typeof message_id);

		if (isNaN(message_id)) {
			return { success: false };
		}
		deleteContactMessage(message_id);
		return { success: true };
	},
};

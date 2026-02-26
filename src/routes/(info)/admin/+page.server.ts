import { dev } from '$app/environment';
import { createSession, generateSessionToken } from '$lib/server/auth';
import {
	deleteContactMessage,
	getContactMessages,
	deleteSpamMessage,
	getSpamMessages,
} from '$lib/server/contactDB.js';
import { getUser } from '$lib/server/usersDB.js';
import { error, type RequestEvent } from '@sveltejs/kit';

// This two need to be explicitly imported for use in the `deleteMessageHandler` function
import type { RouteId, RouteParams } from './$types.js';

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
			spam: getSpamMessages(),
		};
	}
};

export const actions = {
	'delete-message': deleteMessageHandler({ spam: false }),
	'delete-spam': deleteMessageHandler({ spam: true }),
};

// Return handler for deleting messages from spam or normal table
function deleteMessageHandler({ spam }: { spam: boolean }) {
	return async ({ request }: RequestEvent<RouteParams, RouteId>) => {
		const message_id = Number((await request.formData()).get('id') ?? undefined);
		if (isNaN(message_id)) {
			return { success: false };
		}
		if (spam) deleteSpamMessage(message_id);
		else deleteContactMessage(message_id);
		return { success: true };
	};
}

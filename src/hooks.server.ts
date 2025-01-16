import { deleteSessionCookie, setSessionCookie, validateSessionToken } from '$lib/server/auth';
import { getUser } from '$lib/server/usersDB';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');

	if (!token) {
		event.locals.user = undefined;
		event.locals.session = undefined;
		return resolve(event);
	}

	const session = validateSessionToken(token);
	if (session) {
		setSessionCookie(event, token, session);
	} else {
		deleteSessionCookie(event);
	}

	event.locals.session = session || undefined;
	event.locals.user = (session && getUser(session.user_id)) || undefined;
	return resolve(event);
};

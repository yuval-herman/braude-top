import { createSession, generateSessionToken } from '$lib/server/auth';
import { getUser } from '$lib/server/usersDB.js';

export const load = async ({ cookies, locals }) => {
	if (!locals.user) {
		// try to log in
		const userId = 0;
		const user = getUser(userId);
		if (!user) {
			return;
		}

		// after signed in
		const token = generateSessionToken();
		const session = createSession(token, userId);

		cookies.set('session', token, {
			httpOnly: true,
			sameSite: 'lax',
			expires: session.expires_at,
			path: '/',
		});

		return { session, user, signedBy: 'credentials' };
	}
	return { session: locals.session, user: locals.user, signedBy: 'cookie' };
};

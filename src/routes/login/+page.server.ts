import { deleteSessionCookie, invalidateSession } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	'log-out': async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		invalidateSession(event.locals.session.id);
		deleteSessionCookie(event);
		return redirect(302, '/');
	},
};

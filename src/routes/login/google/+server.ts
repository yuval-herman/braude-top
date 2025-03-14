import { generateState, generateCodeVerifier } from 'arctic';
import { google } from '$lib/server/auth';
import { generateSessionToken } from '$lib/server/auth';
import { createSession } from '$lib/server/auth';
import { setSessionCookie } from '$lib/server/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';

export async function GET(event) {
	if (dev) {
		return signFirstUserAdmin(event);
	}
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile']);

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax',
	});
	event.cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax',
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	});
}

function signFirstUserAdmin(event: RequestEvent) {
	const sessionToken = generateSessionToken();
	const session = createSession(sessionToken, 1);
	setSessionCookie(event, sessionToken, session);
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
		},
	});
}

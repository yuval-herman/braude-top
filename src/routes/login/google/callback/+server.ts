import { generateSessionToken, createSession, setSessionCookie, google } from '$lib/server/auth';
import { decodeIdToken } from 'arctic';

import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import { getUserByGoogle, insertUser } from '$lib/server/usersDB';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;
	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return new Response(null, {
			status: 400,
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400,
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400,
		});
	}
	const claims = decodeIdToken(tokens.idToken());
	// @ts-expect-error
	const googleUserId = claims.sub;
	// @ts-expect-error
	const username = claims.name;

	const existingUser = getUserByGoogle(googleUserId);

	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = createSession(sessionToken, existingUser.id);
		setSessionCookie(event, sessionToken, session);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	}

	const user = insertUser({ google_id: googleUserId, name: username, role: 'normal' });

	const sessionToken = generateSessionToken();
	const session = createSession(sessionToken, user.lastInsertRowid);
	setSessionCookie(event, sessionToken, session);
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
		},
	});
}

import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { deleteSession, getSession, insertSession, updateSessionExpiration } from './usersDB';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { Google } from 'arctic';
import type { RequestEvent } from '@sveltejs/kit';

export const google = new Google(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	'http://localhost:5173/login/google/callback'
);

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export function createSession(token: string, user_id: number | bigint): Session {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		user_id,
		expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
	};
	insertSession(session);
	return session;
}

export function validateSessionToken(token: string): Session | null {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = getSession(sessionId);
	if (!session) {
		return null;
	}
	// if session expired, delete it and return null
	if (Date.now() >= session.expires_at.getTime()) {
		deleteSession(session.id);
		return null;
	}
	// if session is expired in 15 days, extend the expiration to another month
	if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		updateSessionExpiration(session);
	}
	return session;
}

export function invalidateSession(sessionId: string): void {
	deleteSession(sessionId);
}

export function deleteSessionCookie(event: RequestEvent) {
	event.cookies.delete('session', { path: '/' });
}

export function setSessionCookie(event: RequestEvent, token: string, session: Session) {
	event.cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: session.expires_at,
		path: '/',
	});
}

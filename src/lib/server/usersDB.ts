import Database from 'better-sqlite3';
import schema from './sql/prepare.users.sql?raw';
import { setVersion } from '$lib/utils/db.utils';

const usersDB = new Database('data/users.db');

setVersion(usersDB, 1);

usersDB.exec(schema);

/** Insert session into DB */
export const insertSession = (() => {
	const stmt = usersDB.prepare<Omit<Session, 'expires_at'> & { expires_at: string }>(
		'INSERT INTO session (id, user_id, expires_at) VALUES (:id, :user_id, :expires_at)'
	);
	return (session: Session) =>
		stmt.run({ ...session, expires_at: session.expires_at.toISOString() });
})();

/** Retrieve a session */
export const getSession = (() => {
	const stmt = usersDB.prepare<string, Omit<Session, 'expires_at'> & { expires_at: string }>(
		'SELECT * FROM session WHERE id = ?'
	);
	return (session_id: string): Session | undefined => {
		const session = stmt.get(session_id);
		return session ? { ...session, expires_at: new Date(session.expires_at) } : undefined;
	};
})();

/** delete a session */
export const deleteSession = (() => {
	const stmt = usersDB.prepare<string>('DELETE FROM session WHERE id = ?');
	return (session_id: string) => stmt.run(session_id);
})();

/** update session expiration date */
export const updateSessionExpiration = (() => {
	const stmt = usersDB.prepare<Omit<Session, 'user_id' | 'expires_at'> & { expires_at: string }>(
		'UPDATE session SET expires_at = :expires_at WHERE id = :id'
	);
	return (session: Omit<Session, 'user_id'>) =>
		stmt.run({ ...session, expires_at: session.expires_at.toISOString() });
})();

/** Retrieve a user */
export const getUser = (() => {
	const stmt = usersDB.prepare<[number | bigint], User>('SELECT * FROM user WHERE id = ?');
	return (user_id: number | bigint): User | undefined => stmt.get(user_id);
})();

/** Retrieve a user by google id */
export const getUserByGoogle = (() => {
	const stmt = usersDB.prepare<number, User>('SELECT * FROM user WHERE google_id = ?');
	return (user_id: number): User | undefined => stmt.get(user_id);
})();

/** Insert user into db */
export const insertUser = (() => {
	const stmt = usersDB.prepare<Omit<User, 'id'>>(
		'INSERT INTO user (google_id, role, name) VALUES (:google_id, :role, :name)'
	);
	return (user: Omit<User, 'id'>) => stmt.run(user);
})();

/** Insert or update user settings into db */
export const upsertSettings = (() => {
	interface Args {
		user_id: User['id'];
		settings: Settings;
	}
	const stmt = usersDB.prepare<Omit<Args, 'settings'> & { settings: string }>(
		'INSERT INTO user_data(user_id,settings)\
		 VALUES(:user_id,:settings)\
		 ON CONFLICT(user_id)\
		 DO UPDATE SET settings = :settings\
		 WHERE user_id = :user_id;'
	);

	return (args: Args) => stmt.run({ ...args, settings: JSON.stringify(args.settings) });
})();

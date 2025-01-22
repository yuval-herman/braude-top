import type { Database } from 'better-sqlite3';

export function getVersion(db: Database) {
	return db.pragma('user_version', { simple: true });
}

export function setVersion(db: Database, version: number) {
	db.pragma(`user_version=${version}`);
}

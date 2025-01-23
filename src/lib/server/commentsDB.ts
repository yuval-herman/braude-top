import Database from 'better-sqlite3';
import schema from './sql/prepare.comments.sql?raw';
import { setVersion } from '$lib/utils/db.utils';

const commentsDB = new Database('data/comments.db');

setVersion(commentsDB, 1);

commentsDB.exec(schema);

/** Adds a new comment */
export const insertComment = (() => {
	type InsertedComment = Omit<UserComment, 'created_at' | 'updated_at' | 'is_flagged' | 'id'>;
	const stmt = commentsDB.prepare<Omit<InsertedComment, 'is_anon'> & { is_anon: number }>(
		`INSERT INTO comments (course_id, course_year, user_id, content, rating, is_anon)
         VALUES (:course_id, :course_year, :user_id, :content, :rating, :is_anon)`
	);
	return (args: InsertedComment) => stmt.run({ ...args, is_anon: Number(args.is_anon) });
})();

/** Retrieves comments for a specific course */
export const getCommentsByCourse = (() => {
	const stmt = commentsDB.prepare<
		{
			course_id: number;
			course_year: number;
		},
		UserComment
	>(
		`SELECT * FROM comments WHERE course_id = :course_id AND course_year = :course_year
		ORDER BY created_at`
	);
	return (course_id: number, course_year: number) => stmt.all({ course_id, course_year });
})();

/** Retrieve user comment for course */
export const getUserCommentsByCourse = (() => {
	type Args = {
		course_id: number;
		course_year: number;
		user_id: number | bigint;
	};

	const stmt = commentsDB.prepare<Args, UserComment>(
		`SELECT * FROM comments
		WHERE course_id = :course_id AND course_year = :course_year AND user_id = :user_id
		ORDER BY created_at`
	);
	return (args: Args) => stmt.all(args);
})();

/** Updates a comment's content */
export const updateComment = (() => {
	const stmt = commentsDB.prepare<{
		id: number;
		content: string;
	}>(`UPDATE comments SET content = :content, updated_at = datetime('now') WHERE id = :id`);
	return (id: number, content: string) => stmt.run({ id, content });
})();

/** Deletes a comment by ID */
export const deleteComment = (() => {
	const stmt = commentsDB.prepare<number>(`DELETE FROM comments WHERE id = ?`);
	return (id: number) => stmt.run(id);
})();

/** Flags a comment for moderation */
export const flagComment = (() => {
	const stmt = commentsDB.prepare<{
		id: number;
		is_flagged: boolean;
	}>(`UPDATE comments SET is_flagged = :is_flagged WHERE id = :id`);
	return (id: number, is_flagged: boolean) => stmt.run({ id, is_flagged });
})();

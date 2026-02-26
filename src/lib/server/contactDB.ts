import Database from 'better-sqlite3';
import schema from './sql/prepare.contact.sql?raw';
import { setVersion } from '$lib/utils/db.utils';

const contactDB = new Database('data/contact.db');

setVersion(contactDB, 2);

contactDB.exec(schema);

/** Store a contact message */
export const setContactMessage = (() => {
	const stmt = contactDB.prepare<ContactMessage>(
		'INSERT INTO messages (name, email, type, message, date) values (:name, :email, :type, :message, :date)'
	);
	return (message: ContactMessage) => stmt.run(message);
})();

/** Delete a contact message */
export const deleteContactMessage = (() => {
	const stmt = contactDB.prepare<number>('DELETE FROM messages WHERE id = ?');
	return (message_id: number) => stmt.run(message_id);
})();

/** Retrieve all messages */
export const getContactMessages = (() => {
	const stmt = contactDB.prepare<[], ContactMessage>('SELECT * FROM messages');
	return () => stmt.all();
})();

/** Store a spam contact message */
export const setSpamMessage = (() => {
	const stmt = contactDB.prepare<SpamMessage>(
		'INSERT INTO spam_messages (name, email, type, message, additional, date) values (:name, :email, :type, :message, :additional, :date)'
	);
	return (message: SpamMessage) => stmt.run(message);
})();

/** Delete a spam message */
export const deleteSpamMessage = (() => {
	const stmt = contactDB.prepare<number>('DELETE FROM spam_messages WHERE id = ?');
	return (message_id: number) => stmt.run(message_id);
})();

/** Retrieve all spam messages */
export const getSpamMessages = (() => {
	const stmt = contactDB.prepare<[], SpamMessage>('SELECT * FROM spam_messages');
	return () => stmt.all();
})();

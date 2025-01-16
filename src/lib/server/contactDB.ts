import Database from 'better-sqlite3';
import schema from './sql/prepare.contact.sql?raw';

const contactDB = new Database('data/contact.db');

contactDB.exec(schema);

/** Store a contact message */
export const setContactMessage = (() => {
	const stmt = contactDB.prepare<ContactMessage>(
		'INSERT INTO messages (name, email, type, message, date) values (:name, :email, :type, :message, :date)'
	);
	return (message: ContactMessage) => stmt.run(message);
})();

/** Store a contact message */
export const deleteContactMessage = (() => {
	const stmt = contactDB.prepare<number>('DELETE FROM messages WHERE id = ?');
	return (message_id: number) => stmt.run(message_id);
})();

/** Retrieve all messages */
export const getContactMessages = (() => {
	const stmt = contactDB.prepare<[], ContactMessage>('SELECT * FROM messages');
	return () => stmt.all();
})();

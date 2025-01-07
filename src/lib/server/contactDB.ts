import Database from 'better-sqlite3';
import schema from 'sql/prepare.contact.sql?raw';

const contactDB = new Database('data/contact.db');

contactDB.exec(schema);

/** Store a contact message */
export const setContactMessage = (() => {
	const stmt = contactDB.prepare<number, CourseExam>(
		'SELECT * from exams WHERE course_instance_id = ?'
	);
	return (id: number | string) => stmt.all(id as number);
})();

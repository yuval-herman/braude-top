import Database from 'better-sqlite3';

const db = new Database('src/lib/courses.db');

const p = db.prepare<[], string>('SELECT name FROM courses ORDER by name').pluck();
export const getCourseNames = () => p.all();

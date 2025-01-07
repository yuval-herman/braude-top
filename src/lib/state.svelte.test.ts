import { describe, expect, it } from 'vitest';
import { addSelectedCourse, removeSelectedCourse, selectedCourses } from './state.svelte';

describe('Selected courses state', () => {
	const emptyCourse: FullCourse = {
		course_id: 0,
		credit: 0,
		description: '',
		syllabus_link: '',
		year: '',
		name: 'קורס ריק',
		instances: [],
	};
	const instance: FullCourseInstance = {
		type: 'הרצאה',
		co_requirements: '',
		course_id: 1,
		course_instance_id: 1,
		exams: [],
		extra_notes: null,
		group_name: '',
		hours: 0,
		instructor: 'מרצה א',
		is_full: 0,
		language: '',
		sessions: [
			{
				course_instance_id: 1,
				week_day: 'א',
				start_time: '8:30',
				end_time: '9:30',
				room: 'חדר 101',
				semester: '',
			},
		],
	};
	it('checks the state starts empty', () => {
		expect(selectedCourses.length).toBe(0);
	});
	it('adds an empty course', () => {
		addSelectedCourse(emptyCourse);
		expect(selectedCourses).toEqual([emptyCourse]);
	});
	it('adds a session on the course', () => {
		addSelectedCourse({ ...emptyCourse, instances: [instance] });
		expect(selectedCourses).not.toEqual([emptyCourse]);
		expect(selectedCourses).toEqual([{ ...emptyCourse, instances: [instance] }]);
	});
	it('removes a session on the course', () => {
		removeSelectedCourse({ ...emptyCourse, instances: [instance] });
		expect(selectedCourses.length).toBe(0);
	});
});

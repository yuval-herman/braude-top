import { describe, expect, it } from 'vitest';
import { itemizeCourse, itemizeCourseList } from './utils';

describe('Course transforming utilities', () => {
	it('transforms a course with no instances into an empty array', () => {
		const emptyCourse: FullCourse = {
			course_id: 0,
			credit: 0,
			description: '',
			syllabus_link: '',
			year: 2025,
			name: 'קורס ריק',
			instances: [],
		};
		const result = itemizeCourse(emptyCourse);
		expect(result).toEqual([]);
	});

	it('transforms a course with instances and sessions into an array of items', () => {
		const course: FullCourse = {
			course_id: 1,
			credit: 0,
			description: '',
			syllabus_link: '',
			year: 2025,
			name: 'קורס ראשון',
			instances: [
				{
					year: 2025,
					attendance_mandatory: false,
					has_lab: false,
					studied_online: false,
					waiting_list: false,
					faculty: [],
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
				},
				{
					year: 2025,
					attendance_mandatory: false,
					has_lab: false,
					studied_online: false,
					waiting_list: false,
					faculty: [],
					type: 'מעבדה',
					co_requirements: '',
					course_id: 1,
					course_instance_id: 2,
					exams: [],
					extra_notes: null,
					group_name: '',
					hours: 0,
					instructor: 'מרצה ב',
					is_full: 0,
					language: '',
					sessions: [
						{
							course_instance_id: 2,
							week_day: 'ג',
							start_time: '10:30',
							end_time: '12:20',
							room: 'חדר 202',
							semester: '',
						},
					],
				},
			],
		};
		const result = itemizeCourse(course);
		expect(result).toEqual([
			{
				colorIndicator: '#52a59a',
				day: 0,
				start: 1,
				end: 2,
				type: 'הרצאה',
				value: {
					instructor: 'מרצה א',
					name: 'קורס ראשון',
					room: 'חדר 101',
				},
			},
			{
				colorIndicator: '#52a59a',
				day: 2,
				start: 3,
				end: 5,
				type: 'מעבדה',
				value: {
					instructor: 'מרצה ב',
					name: 'קורס ראשון',
					room: 'חדר 202',
				},
			},
		]);
	});

	it('handles edge cases like invalid week days and empty sessions', () => {
		const edgeCaseCourse: FullCourse = {
			course_id: 2,
			credit: 0,
			description: '',
			syllabus_link: '',
			year: 2025,
			name: 'קורס קצה',
			instances: [
				{
					year: 2025,
					attendance_mandatory: false,
					has_lab: false,
					studied_online: false,
					waiting_list: false,
					faculty: [],
					type: 'הרצאה',
					co_requirements: '',
					course_id: 2,
					course_instance_id: 3,
					exams: [],
					extra_notes: null,
					group_name: '',
					hours: 0,
					instructor: 'מרצה ג',
					is_full: 0,
					language: '',
					sessions: [],
				},
				{
					year: 2025,
					attendance_mandatory: false,
					has_lab: false,
					studied_online: false,
					waiting_list: false,
					faculty: [],
					type: 'מעבדה',
					co_requirements: '',
					course_id: 2,
					course_instance_id: 4,
					exams: [],
					extra_notes: null,
					group_name: '',
					hours: 0,
					instructor: 'מרצה ד',
					is_full: 0,
					language: '',
					sessions: [
						{
							course_instance_id: 4,
							week_day: 'ז', // Invalid day
							// @ts-expect-error
							start_time: '15:00',
							// @ts-expect-error
							end_time: '16:00',
							room: 'חדר 303',
							semester: '',
						},
					],
				},
			],
		};
		expect(() => itemizeCourse(edgeCaseCourse)).toThrowError('day is not recognized');
		edgeCaseCourse.instances[1].sessions[0].week_day = 'א';
		expect(() => itemizeCourse(edgeCaseCourse)).toThrowError(
			'start or end time were not found in hourList'
		);
		edgeCaseCourse.instances[1].sessions[0].start_time = '15:50';
		edgeCaseCourse.instances[1].sessions[0].end_time = '16:50';

		const result = itemizeCourse(edgeCaseCourse);
		expect(result).toEqual([
			{
				colorIndicator: '#7c73e4',
				day: 0,
				start: 10,
				end: 11,
				type: 'מעבדה',
				value: {
					instructor: 'מרצה ד',
					name: 'קורס קצה',
					room: 'חדר 303',
				},
			},
		]);
	});
});

describe('Course list transforming utilities', () => {
	const course1: FullCourse = {
		course_id: 1,
		credit: 0,
		description: '',
		syllabus_link: '',
		year: 2025,
		name: 'קורס ראשון',
		instances: [
			{
				year: 2025,
				attendance_mandatory: false,
				has_lab: false,
				studied_online: false,
				waiting_list: false,
				faculty: [],
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
						end_time: '10:30',
						room: 'חדר 101',
						semester: '',
					},
				],
			},
		],
	};

	const course2: FullCourse = {
		course_id: 2,
		credit: 0,
		description: '',
		syllabus_link: '',
		year: 2025,
		name: 'קורס שני',
		instances: [
			{
				year: 2025,
				attendance_mandatory: false,
				has_lab: false,
				studied_online: false,
				waiting_list: false,
				faculty: [],
				type: 'מעבדה',
				co_requirements: '',
				course_id: 2,
				course_instance_id: 2,
				exams: [],
				extra_notes: null,
				group_name: '',
				hours: 0,
				instructor: 'מרצה ב',
				is_full: 0,
				language: '',
				sessions: [
					{
						course_instance_id: 2,
						week_day: 'א',
						start_time: '10:30',
						end_time: '11:30',
						room: 'חדר 102',
						semester: '',
					},
				],
			},
		],
	};

	it('detects no overlap between non-overlapping courses', () => {
		const result = itemizeCourseList([course1, course2]);
		expect(result).toHaveLength(2);
		expect(result[0].overlapping).toBeUndefined();
		expect(result[1].overlapping).toBeUndefined();
	});

	it('detects overlap when the first course partially overlaps the second', () => {
		course1.instances[0].sessions[0].start_time = '8:30';
		course1.instances[0].sessions[0].end_time = '10:30';
		course2.instances[0].sessions[0].start_time = '9:30';
		course2.instances[0].sessions[0].end_time = '10:30';

		const result = itemizeCourseList([course1, course2]);
		expect(result).toHaveLength(2);
		expect(result[0].overlapping).toBeTruthy();
		expect(result[1].overlapping).toBeTruthy();
	});

	it('detects overlap when the second course partially overlaps the first', () => {
		course1.instances[0].sessions[0].start_time = '9:30';
		course1.instances[0].sessions[0].end_time = '10:30';
		course2.instances[0].sessions[0].start_time = '8:30';
		course2.instances[0].sessions[0].end_time = '10:30';

		const result = itemizeCourseList([course1, course2]);
		expect(result).toHaveLength(2);
		expect(result[0].overlapping).toBeTruthy();
		expect(result[1].overlapping).toBeTruthy();
	});

	it('detects overlap when courses have the exact same timing', () => {
		course1.instances[0].sessions[0].start_time = '9:30';
		course1.instances[0].sessions[0].end_time = '10:30';
		course2.instances[0].sessions[0].start_time = '9:30';
		course2.instances[0].sessions[0].end_time = '10:30';

		const result = itemizeCourseList([course1, course2]);
		expect(result).toHaveLength(2);
		expect(result[0].overlapping).toBeTruthy();
		expect(result[1].overlapping).toBeTruthy();
	});

	it('detects no overlap when courses are adjacent but not overlapping', () => {
		course1.instances[0].sessions[0].start_time = '8:30';
		course1.instances[0].sessions[0].end_time = '9:30';
		course2.instances[0].sessions[0].start_time = '9:30';
		course2.instances[0].sessions[0].end_time = '10:30';

		const result = itemizeCourseList([course1, course2]);
		expect(result).toHaveLength(2);
		expect(result[0].overlapping).toBeUndefined();
		expect(result[1].overlapping).toBeUndefined();
	});

	it('handles multiple overlaps in a complex schedule', () => {
		course1.instances[0].sessions[0].start_time = '8:30';
		course1.instances[0].sessions[0].end_time = '10:30';
		course2.instances[0].sessions[0].start_time = '10:30';
		course2.instances[0].sessions[0].end_time = '12:20';

		const course3: FullCourse = {
			course_id: 3,
			credit: 0,
			description: '',
			syllabus_link: '',
			year: 2025,
			name: 'קורס שלישי',
			instances: [
				{
					year: 2025,
					attendance_mandatory: false,
					has_lab: false,
					studied_online: false,
					waiting_list: false,
					faculty: [],
					type: 'תרגול',
					co_requirements: '',
					course_id: 3,
					course_instance_id: 3,
					exams: [],
					extra_notes: null,
					group_name: '',
					hours: 0,
					instructor: 'מרצה ג',
					is_full: 0,
					language: '',
					sessions: [
						{
							course_instance_id: 3,
							week_day: 'א',
							start_time: '9:30',
							end_time: '11:30',
							room: 'חדר 103',
							semester: '',
						},
					],
				},
			],
		};

		const result = itemizeCourseList([course1, course2, course3]);
		expect(result).toHaveLength(3);

		expect(result[0].overlapping).toBeTruthy(); // Overlaps with course2 and course3
		expect(result[1].overlapping).toBeTruthy(); // Overlaps with course1 and course3
		expect(result[2].overlapping).toBeTruthy(); // Overlaps with course1 and course2
	});
});

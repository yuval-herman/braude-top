import { toggleInstance } from '$lib/courseManager.svelte';
import { hoveredInstanceId, toggleRoom } from '$lib/state.svelte';
import { hoursList, instanceColors } from './constants.utils';
import { num2color } from './css.utils';

export function time2Index(timestring: string): number | undefined {
	const [chour, cmin] = timestring.split(':').map(Number);
	let index = hoursList.findIndex(({ hour, min }) => hour === chour && min === cmin);
	return index === -1 ? undefined : index;
}

export function day2Index(day: string) {
	const first_day = 1488;
	const index = day.charCodeAt(0) - first_day;
	if (index < 0 || index > 5) {
		throw new Error('day is not recognized');
	}
	return index;
}

export function itemizeEmptyRoom(room: EmptyRoom): Item<EmptyRoomItemValue> {
	const day = day2Index(room.week_day);
	const start = time2Index(room.start_time);
	const end = time2Index(room.end_time);

	if (start === undefined || end === undefined) {
		throw new Error('start or end time were not found in hourList');
	}

	return {
		day,
		start,
		end,
		bgColor: 'white',
		indicatorColor: 'white',
		onclick: () => toggleRoom(room, room.year, room.semester),
		value: { type: 'empty-room', name: 'חדר ריק', room: room.room },
	};
}

export function itemizeCourse(
	{ name, instances, course_id, year }: FullCourse,
	is_preview = false
): Item[] {
	return instances.flatMap(({ sessions, instructor, type, course_instance_id }) =>
		sessions.map(({ week_day, start_time, end_time, room }): Item => {
			const day = day2Index(week_day);

			const start = time2Index(start_time);
			const end = time2Index(end_time);

			if (start === undefined || end === undefined) {
				throw new Error('start or end time were not found in hourList');
			}

			return {
				onhover: () => (hoveredInstanceId.id = course_instance_id),
				onstopHover: () => (hoveredInstanceId.id = undefined),
				onclick: () => ((hoveredInstanceId.id = undefined), toggleInstance(course_instance_id)),
				day,
				end,
				start,
				is_preview,
				value: { type: 'session', session_type: type, name, room, instructor },
				indicatorColor: instanceColors.get(type) ?? (instanceColors.get('default') as string),
				bgColor: num2color(course_id),
			};
		})
	);
}

export function itemizeCourseList(courses: FullCourse[]): Item[] {
	const items = courses.flatMap((c) => itemizeCourse(c));
	items.sort((a, b) => a.day - b.day || a.start - b.start || a.end - b.end);
	for (let i = 0; i < items.length - 1; i++) {
		const curr = items[i];
		const next = items[i + 1];
		if (next.day === curr.day && next.start < curr.end) {
			// TODO there could be more then one overlap, but since the ui does not support it ATM this is fine
			if (curr.overlapping) curr.overlapping.overlapIndex++;
			else curr.overlapping = { overlapIndex: 0 };
			next.overlapping = { overlapIndex: 1 };
		}
	}
	return items;
}

import { toggleInstance } from '$lib/courseManager.svelte';
import { hoveredInstanceId, toggleRoom } from '$lib/state.svelte';
import { instanceColors, type Institute } from './constants.utils';
import { num2color } from './css.utils';

export function time2Index(hoursList: Time[], timestring: string) {
	const [chour, cmin] = timestring.split(':').map(Number);
	let index = hoursList.findIndex(({ hour, min }) => hour === chour && min === cmin);
	if (index === -1) throw new Error(`time (${timestring}) was not found in hourList`);
	else return index;
}

const week_days: string[] = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'] as const;

// There are two variants of weekday formats, one that uses a single letter, like א,
// and one that uses the whole name, like ראשון
export function day2Index(day: string) {
	// single letter variant
	if (day.length === 1) {
		const first_day = 1488;
		const index = day.charCodeAt(0) - first_day;
		if (index < 0 || index > 5) {
			throw new Error(`day '${day}' is not recognized`);
		}
		return index;
	}
	const index = week_days.indexOf(day);
	if (index < 0 || index > 5) {
		throw new Error(`day '${day}' is not recognized`);
	}
	return index;
}

export function itemizeEmptyRoom(
	institute: Institute,
	hoursList: Time[],
	room: EmptyRoom
): Item<EmptyRoomItemValue> {
	const day = day2Index(room.week_day);
	const start = time2Index(hoursList, room.start_time);
	const end = time2Index(hoursList, room.end_time);

	return {
		time_string: `${room.start_time} - ${room.end_time}`,
		day,
		start,
		end,
		bgColor: 'white',
		indicatorColor: 'white',
		onclick: () => toggleRoom(institute, room, room.year, room.semester),
		value: { type: 'empty-room', name: 'חדר ריק', room: room.room },
	};
}

export function itemizeCourse(
	institute: Institute,
	hoursList: Time[],
	{ name, instances, course_id }: Course,
	is_preview = false
): Item[] {
	return instances.flatMap(({ sessions, instructor, type, instance_id }) =>
		sessions.map(({ week_day, start_time, end_time, room }): Item => {
			const day = day2Index(week_day);

			const start = time2Index(hoursList, start_time);
			const end = time2Index(hoursList, end_time);

			return {
				onhover: () => (hoveredInstanceId.id = instance_id),
				onstopHover: () => (hoveredInstanceId.id = undefined),
				onclick: () => ((hoveredInstanceId.id = undefined), toggleInstance(institute, instance_id)),
				time_string: `${start_time} - ${end_time}`,
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

export function itemizeCourseList(
	institute: Institute,
	hoursList: Time[],
	courses: Course[]
): Item[] {
	const items = courses.flatMap((c) => itemizeCourse(institute, hoursList, c));
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

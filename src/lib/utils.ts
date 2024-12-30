import type { CourseSession } from './types';

export const hoursList = [
	{ hour: 8, min: 30 },
	{ hour: 9, min: 30 },
	{ hour: 10, min: 30 },
	{ hour: 11, min: 30 },
	{ hour: 12, min: 20 },
	{ hour: 12, min: 50 },
	{ hour: 13, min: 50 },
	{ hour: 14, min: 50 },
	{ hour: 15, min: 50 },
	{ hour: 16, min: 50 },
	{ hour: 17, min: 50 },
	{ hour: 18, min: 50 },
	{ hour: 19, min: 50 },
	{ hour: 20, min: 50 },
	{ hour: 21, min: 50 },
	{ hour: 22, min: 50 }
];

function time2Index(timestring: string) {
	const [chour, cmin] = timestring.split(':').map(Number);
	const index = hoursList.findIndex(({ hour, min }) => hour === chour && min === cmin);
	return index === -1 ? undefined : index + 1;
}

export function itemizeSession({ week_day, start_time, end_time }: CourseSession) {
	const first_day = 1488;
	const day = week_day.charCodeAt(0) - first_day;
	const start = time2Index(start_time);
	const end = time2Index(end_time);
	if (!start || !end) {
		throw new Error('start or end time were not found in hourList');
	}
	return {
		day,
		start,
		end
	};
}

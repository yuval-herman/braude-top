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
	{ hour: 22, min: 50 },
] as const;

export function time2Index(timestring: string): number | undefined {
	const [chour, cmin] = timestring.split(':').map(Number);
	let index = hoursList.findIndex(({ hour, min }) => hour === chour && min === cmin);
	if (index > 4) index++; // take lunch into account
	return index === -1 ? undefined : index + 1;
}

export function itemizeCourse({ name, instances }: FullCourse): Item[] {
	const first_day = 1488;
	return instances.flatMap(({ sessions, instructor, type }) =>
		sessions.map(({ week_day, start_time, end_time, room }): Item => {
			const day = week_day.charCodeAt(0) - first_day;
			if (day < 0 || day > 5) {
				throw new Error('day is not recognized');
			}

			const start = time2Index(start_time);
			const end = time2Index(end_time);

			if (!start || !end) {
				throw new Error('start or end time were not found in hourList');
			}
			return {
				day,
				end,
				start,
				type,
				value: { name, room, instructor },
				colorIndicator: colors.str2color(name),
			};
		})
	);
}

export function itemizeCourseList(courses: FullCourse[]): Item[] {
	const items = courses.flatMap(itemizeCourse);
	for (let i = 0; i < items.length; i++) {
		const { start: istart, end: iend, day: iday } = items[i];
		for (let j = i + 1; j < items.length; j++) {
			const { start: jstart, end: jend, day: jday } = items[j];
			if (
				((istart <= jstart && jstart < iend) || (istart < jend && jstart < istart)) &&
				iday === jday
			) {
				items[i].is_overlapping = true;
				items[j].is_overlapping = true;
			}
		}
	}
	return items;
}

export const dayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'long' });
export const hourFormatter = new Intl.DateTimeFormat('he-IL', {
	timeStyle: 'short',
});
export const listFormatter = new Intl.ListFormat('he-IL');

const date = new Date(0);
export function getDay(day: number) {
	return date.setDate(4 + day), dayFormatter.format(date);
}

export function getHour(hour: number, min: number) {
	return date.setHours(hour, min), hourFormatter.format(date);
}

export function randomNumber(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

type Range = { from: number; to: number };
const colors = {
	colorMix(a: string, b: string, percent: number = 50) {
		return `color-mix(in srgb, ${a}, ${b} ${percent}%)`;
	},
	lighten(color: string, percent: number = 10) {
		return `hsl(from ${color} h s calc(l + ${percent}))`;
	},
	saturate(color: string, percent: number = 10) {
		return `hsl(from ${color} h calc(s + ${percent}) l)`;
	},
	randomColor(
		hueMax: Range = { from: 0, to: 360 },
		satMax: Range = { from: 0, to: 100 },
		lightMax: Range = { from: 0, to: 100 }
	) {
		const hue = randomNumber(hueMax.from, hueMax.to);
		const sat = randomNumber(satMax.from, satMax.to);
		const light = randomNumber(lightMax.from, lightMax.to);
		return `hsl(${hue}, ${sat}%, ${light}%)`;
	},
	str2color(str: string) {
		let hash = 0;
		str.split('').forEach((char) => {
			hash = char.charCodeAt(0) + ((hash << 5) - hash);
		});
		let color = '#';
		for (let i = 0; i < 3; i++) {
			const value = (hash >> (i * 8)) & 0xff;
			color += value.toString(16).padStart(2, '0');
		}
		return color;
	},
	num2color(num: number) {
		let hex = num.toString(16);
		if (hex.length !== 6) {
			const shift = 6 - hex.length;
			hex = (num * 10 ** shift).toString(16);
		}
		return '#' + hex;
	},
};

export const css = { colors } as const;
export const instanceColors = new Map(
	Object.entries({
		הרצאה: colors.lighten('var(--primary)'),
		תרגיל: colors.colorMix('var(--primary)', 'PaleGreen', 50),
		מעבדה: colors.colorMix('var(--primary)', 'Aquamarine', 50),
		default: 'var(--primary)',
	})
);

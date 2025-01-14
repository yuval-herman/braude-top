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

export function itemizeCourse({ name, instances, course_id }: FullCourse): Item[] {
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
				indicatorColor: instanceColors.get(type) ?? (instanceColors.get('default') as string),
				bgColor: colors.num2color(course_id),
			};
		})
	);
}

export function itemizeCourseList(courses: FullCourse[]): Item[] {
	const items = courses.flatMap(itemizeCourse);
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

export function getPropertiesOfCourse(course: FullCourse) {
	const languages = new Set<string>();
	const types = new Set<string>();
	const notes: { id: number; note: string }[] = [];
	let fullInstances = new Map<string, number>();

	for (const instance of course.instances) {
		if (instance.language) languages.add(instance.language);
		if (instance.is_full)
			fullInstances.set(instance.type, (fullInstances.get(instance.type) ?? 0) + 1);
		if (instance.extra_notes)
			notes.push({ note: instance.extra_notes, id: instance.course_instance_id });

		types.add(instance.type);
	}

	return { languages, types, fullInstances, notes };
}

export function debounce<TArgs extends any[]>(func: (...args: TArgs) => void, delay: number) {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: TArgs) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), delay);
	};
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

/**
 * Creates a random function using the provided four seed (a,b,c,d)
 */
function hashNumber(num: number) {
	num |= 0;
	num = (num + 0x9e3779b9) | 0;
	let t = num ^ (num >>> 16);
	t = Math.imul(t, 0x21f0aaad);
	t = t ^ (t >>> 15);
	t = Math.imul(t, 0x735a2d97);
	return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
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
		return '#' + Math.trunc(hashNumber(num) * 16 ** 6).toString(16);
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

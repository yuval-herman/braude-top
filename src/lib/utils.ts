import parseColor from 'color-parse';

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

export const buildings = [
	'D',
	'EF',
	'EM',
	'L',
	'M',
	'P',
	'אולם ספורט',
	// 'fab lab',
] as const;
export const walkTimes = {
	D: {
		EF: { dist: 207, time: 4 },
		EM: { dist: 478, time: 6 },
		L: { dist: 329, time: 5 },
		M: { dist: 220, time: 4 },
		'אולם ספורט': { dist: 110, time: 2 },
		P: { dist: 534, time: 7 },
		// 'fab lab': undefined,
	},
	EF: {
		D: { dist: 207, time: 4 },
		EM: { dist: 123, time: 2 },
		L: { dist: 173, time: 3 },
		M: { dist: 81, time: 1 },
		'אולם ספורט': { dist: 101, time: 1 },
		P: { dist: 698, time: 12 },
		// 'fab lab': undefined,
	},
	EM: {
		D: { dist: 478, time: 6 },
		EF: { dist: 123, time: 2 },
		L: { dist: 268, time: 5 },
		M: { dist: 242, time: 4 },
		'אולם ספורט': { dist: 230, time: 4 },
		P: { dist: 636, time: 11 },
		// 'fab lab': undefined,
	},
	L: {
		D: { dist: 329, time: 5 },
		EF: { dist: 173, time: 3 },
		EM: { dist: 268, time: 5 },
		M: { dist: 29, time: 1 },
		'אולם ספורט': { dist: 249, time: 3 },
		P: { dist: 732, time: 12 },
		// 'fab lab': undefined,
	},
	M: {
		D: { dist: 220, time: 4 },
		EF: { dist: 81, time: 1 },
		EM: { dist: 242, time: 4 },
		L: { dist: 29, time: 1 },
		'אולם ספורט': { dist: 164, time: 2 },
		P: { dist: 772, time: 12 },
		// 'fab lab': undefined,
	},
	'אולם ספורט': {
		D: { dist: 110, time: 2 },
		EF: { dist: 101, time: 1 },
		EM: { dist: 230, time: 4 },
		L: { dist: 249, time: 3 },
		M: { dist: 164, time: 2 },
		P: { dist: 596, time: 11 },
		// 'fab lab': undefined,
	},
	P: {
		D: { dist: 534, time: 7 },
		EF: { dist: 698, time: 12 },
		EM: { dist: 636, time: 11 },
		L: { dist: 732, time: 12 },
		M: { dist: 772, time: 12 },
		'אולם ספורט': { dist: 596, time: 11 },
		// 'fab lab': undefined,
	},
	// 'fab lab': {
	// 	D: undefined,
	// 	EF: undefined,
	// 	EM: undefined,
	// 	L: undefined,
	// 	M: undefined,
	// 	P: undefined,
	// 	'אולם ספורט': undefined,
	// },
} as const;

export function time2Index(timestring: string): number | undefined {
	const [chour, cmin] = timestring.split(':').map(Number);
	let index = hoursList.findIndex(({ hour, min }) => hour === chour && min === cmin);
	if (index > 4) index++; // take lunch into account
	return index === -1 ? undefined : index + 1;
}

export function itemizeCourse(
	{ name, instances, course_id }: FullCourse,
	is_preview = false
): Item[] {
	const first_day = 1488;
	return instances
		.filter((i) => i.selected)
		.flatMap(({ sessions, instructor, type }) =>
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
					is_preview,
					value: { name, room, instructor, type },
					indicatorColor: instanceColors.get(type) ?? (instanceColors.get('default') as string),
					bgColor: colors.num2color(course_id),
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

export function sameObject(obj1: Record<string, any>, obj2: Record<string, any>) {
	const obj1Keys = Object.keys(obj1);
	const obj2Keys = Object.keys(obj2);

	return obj1Keys.length === obj2Keys.length && obj1Keys.every((key) => obj1[key] === obj2[key]);
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
		const min = 16 ** 5,
			max = 16 ** 6;

		return '#' + Math.trunc(hashNumber(num) * (max - min) + min).toString(16);
	},
};

const a11y = {
	getContrast({ background, dark, light }: { background: string; light: string; dark: string }) {
		const rgb = parseColor(background).values;
		// http://www.w3.org/TR/AERT#color-contrast
		const brightness = Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000);
		return brightness > 125 ? dark : light;
	},
};

export const css = { colors, a11y } satisfies Record<string, Record<string, Function>>;
export const instanceColors = new Map(
	Object.entries({
		הרצאה: colors.lighten('var(--primary)'),
		תרגיל: colors.colorMix('var(--primary)', 'PaleGreen', 50),
		מעבדה: colors.colorMix('var(--primary)', 'Aquamarine', 50),
		default: 'var(--primary)',
	})
);

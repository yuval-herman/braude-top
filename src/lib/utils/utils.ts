export function debounce<TArgs extends any[]>(func: (...args: TArgs) => void, delay: number) {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: TArgs) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), delay);
	};
}

export function randomNumber(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function stripExcessProperties<T extends object>(obj: T, allowedKeys: (keyof T)[]): T {
	const stripped_obj: Partial<T> = {};
	for (const key in obj) {
		if (allowedKeys.includes(key)) {
			stripped_obj[key] = obj[key];
		}
	}
	return stripped_obj as T;
}

export function sameObject(
	obj1: Record<string, any>,
	obj2: Record<string, any>,
	fields?: string[]
) {
	const obj1Keys = fields
		? Object.keys(obj1).filter((key) => fields.includes(key))
		: Object.keys(obj1);
	const obj2Keys = fields
		? Object.keys(obj2).filter((key) => fields.includes(key))
		: Object.keys(obj2);

	if (obj1Keys.length !== obj2Keys.length) return false;
	return obj1Keys.every((key): boolean => {
		const t = typeof obj1[key];
		if (t !== typeof obj2[key]) return false;
		else if (t === 'object') return sameObject(obj1[key], obj2[key]);
		return obj1[key] === obj2[key];
	});
}

export function hashNumber(num: number) {
	num |= 0;
	num = (num + 0x9e3779b9) | 0;
	let t = num ^ (num >>> 16);
	t = Math.imul(t, 0x21f0aaad);
	t = t ^ (t >>> 15);
	t = Math.imul(t, 0x735a2d97);
	return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
}

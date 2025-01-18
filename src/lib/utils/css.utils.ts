import parseColor from 'color-parse';
import { randomNumber, hashNumber } from './utils';

type Range = { from: number; to: number };

export function colorMix(a: string, b: string, percent: number = 50) {
	return `color-mix(in srgb, ${a}, ${b} ${percent}%)`;
}
export function lighten(color: string, percent: number = 10) {
	return `hsl(from ${color} h s calc(l + ${percent}))`;
}
export function saturate(color: string, percent: number = 10) {
	return `hsl(from ${color} h calc(s + ${percent}) l)`;
}
export function randomColor(
	hueMax: Range = { from: 0, to: 360 },
	satMax: Range = { from: 0, to: 100 },
	lightMax: Range = { from: 0, to: 100 }
) {
	const hue = randomNumber(hueMax.from, hueMax.to);
	const sat = randomNumber(satMax.from, satMax.to);
	const light = randomNumber(lightMax.from, lightMax.to);
	return `hsl(${hue}, ${sat}%, ${light}%)`;
}
export function str2color(str: string) {
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
}
export function num2color(num: number) {
	const min = 16 ** 5,
		max = 16 ** 6;

	return '#' + Math.trunc(hashNumber(num) * (max - min) + min).toString(16);
}

export function getContrast({
	background,
	dark,
	light,
}: {
	background: string;
	light: string;
	dark: string;
}) {
	const rgb = parseColor(background).values;
	// http://www.w3.org/TR/AERT#color-contrast
	const brightness = Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000);
	return brightness > 125 ? dark : light;
}

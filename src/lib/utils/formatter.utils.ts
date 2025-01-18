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

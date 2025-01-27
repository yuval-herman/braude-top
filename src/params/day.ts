const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'] as const;
type Day = (typeof days)[number];

export const match = (param): param is Day => {
	return days.includes(param as Day);
};

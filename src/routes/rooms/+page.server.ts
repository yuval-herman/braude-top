import { getEmptyRoomsByDay, getEmptyRoomsByRoom } from '$lib/server/coursesDB.js';
import { getYearSemester } from '$lib/utils.js';

const week_days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];

export const load = async ({ url, parent }) => {
	const week_day = url.searchParams.get('day') ?? week_days[new Date().getDay() % 6]; // day % 6 Because campus is closed on saturday
	const { year, semester } = getYearSemester(url, (await parent()).availableTimeSpans);

	return {
		rooms: getEmptyRoomsByDay({
			year,
			semester,
			week_day,
		}),
	};
};

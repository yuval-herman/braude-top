import { browser } from '$app/environment';
import { page } from '$app/state';
import { setCurrentEmptyRooms } from './storage';

export const hoveredItems = $state<{
	items: Item[] | undefined;
}>({ items: undefined });
export const hoveredInstanceId = $state<{
	id: number | undefined;
}>({ id: undefined });
export const theme = $state<{ theme: 'auto' | 'light' | 'dark' }>({ theme: 'auto' });
export const selectedEmptyRooms = $state<EmptyRoom[]>([]);

export function toggleRoom(room: EmptyRoom, year: number, semester: string) {
	const roomIndex = selectedEmptyRooms.findIndex(
		(r) =>
			r.week_day === room.week_day &&
			r.start_time === room.start_time &&
			r.end_time === room.end_time &&
			r.room === room.room
	);
	if (roomIndex === -1) {
		selectedEmptyRooms.push(room);
	} else {
		selectedEmptyRooms.splice(roomIndex, 1);
	}
	if (browser) {
		if (page.data.user)
			navigator.sendBeacon(
				'/api/user/update/data',
				JSON.stringify({
					year,
					semester,
					data_type: 'rooms',
					data: $state.snapshot(selectedEmptyRooms),
				})
			);
		setCurrentEmptyRooms(selectedEmptyRooms, year, semester);
	}
}

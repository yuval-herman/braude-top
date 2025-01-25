interface BaseItemValue<TType extends string> {
	name: string;
	type: TType;
}
interface SessionItemValue extends BaseItemValue<'session'> {
	instructor: string;
	room: string;
}
interface CustomItemValue extends BaseItemValue<'custom'> {}
interface EmptyRoomItemValue extends BaseItemValue<'empty-room'> {
	room: string;
}

type ItemValueTypes = SessionItemValue | CustomItemValue | EmptyRoomItemValue;

interface Item<TValue extends BaseItemValue = ItemValueTypes> {
	day: number; // Day of the week 1-6
	start: number; // Start hour as an integer (1=8:30, 2=9:30, etc...)
	end: number; // End hour as an integer
	type: string; // Session type
	value: TValue; // Value to show in cell
	bgColor: string;
	indicatorColor: string;
	is_preview?: boolean;
	highlight?: boolean;
	overlapping?: { overlapIndex: number };
	walk?: {
		dist: number;
		time: number;
	}; // Time the student has to walk
	freeTime?: number;
	onclick?: () => void;
	onhover?: () => void;
	onstopHover?: () => void;
}

interface Settings {
	show_walk_times?: boolean;
	columns_margins?: boolean;
	show_lunch?: boolean;
	anonymous_comment?: boolean;
}

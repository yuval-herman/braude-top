interface Item {
	day: number; // Day of the week 1-6
	start: number; // Start hour as an integer (1=8:30, 2=9:30, etc...)
	end: number; // End hour as an integer
	type: string; // Session type
	value: {
		room: string;
		instructor: string;
		name: string;
	}; // Value to show in cell
	bgColor: string;
	indicatorColor: string;
	is_preview?: boolean;
	highlight?: boolean;
	overlapping?: { overlapIndex: number };
	walk?: {
		dist: number;
		time: number;
	};
	freeTime?: number; // Time the student has to walk
}

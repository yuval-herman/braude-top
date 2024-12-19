export interface Item {
	day: number; // Day of the week 1-6
	start: number; // Start hour as an integer (1=8:30, 2=9:30, etc...)
	end: number; // End hour as an integer
	value: string; // Value to show in cell
}

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User;
			session?: Session;
		}
		interface PageData {
			availableTimeSpans: {
				year: number;
				semesters: string[];
			}[];
			year: number;
			semester: string;
			user?: User;
		}
		interface PageState {
			sidebarOpen: boolean;
		}
		// interface Platform {}
	}
}

export {};

// goatcounter.d.ts

declare namespace GoatCounter {
	interface Settings {
		no_onload?: boolean;
		no_events?: boolean;
		allow_local?: boolean;
		allow_frame?: boolean;
		path?: string | (() => string);
		title?: string | (() => string);
		referrer?: string | (() => string);
		event?: boolean;
	}

	interface VisitCountOptions {
		type?: 'html' | 'png' | 'svg';
		append?: string;
		path?: string;
		attr?: { [key: string]: string | number };
		no_branding?: boolean;
		style?: string;
		start?: string;
		end?: string;
	}

	interface Vars {
		path?: string | (() => string);
		title?: string | (() => string);
		referrer?: string | (() => string);
		event?: boolean;
	}

	interface GoatCounter {
		endpoint?: string;
		no_onload?: boolean;
		no_events?: boolean;
		allow_local?: boolean;
		allow_frame?: boolean;
		path?: string | (() => string);
		title?: string | (() => string);
		referrer?: string | (() => string);
		event?: boolean;

		url(vars?: Vars): string | void;
		count(vars?: Vars): void;
		get_query(name: string): string | undefined;
		bind_events(): void;
		visit_count(opt?: VisitCountOptions): void;
		filter(): string | false;
	}
}

declare interface Window {
	goatcounter: GoatCounter.GoatCounter;
}

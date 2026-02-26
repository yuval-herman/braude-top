interface ContactMessage {
	id?: number;
	name?: string;
	email?: string;
	type: string;
	message: string;
	date: string;
}

interface SpamMessage extends ContactMessage {
	additional: string;
}

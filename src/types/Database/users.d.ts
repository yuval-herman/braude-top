interface Session {
	id: string;
	user_id: number | bigint;
	expires_at: Date;
}

interface User {
	id: number | bigint;
	google_id: string;
	role: string;
	name: string;
}

type SavedDataTypes = 'rooms' | 'courses' | 'instances' | 'active_instance_ids';

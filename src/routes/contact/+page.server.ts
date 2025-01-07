import { setContactMessage } from '$lib/server/contactDB';
import { fail } from '@sveltejs/kit';

export const actions = {
	contact: async ({ request }) => {
		const message = Object.fromEntries(await request.formData());
		message.date = new Date().toISOString();
		if (!verifyMessage(message)) return fail(400, { success: false });

		setContactMessage(message);
		return { success: true };
	}
};

function verifyMessage(message: any): message is ContactMessage {
	const required = ['type', 'message', 'date'];
	const optional = ['email', 'name'];
	for (const key in message) {
		if (typeof message[key] !== 'string') return false;
		if (required.includes(key)) {
			if (message[key].length === 0) return false;
		} else if (!optional.includes(key)) return false;
	}
	return true;
}

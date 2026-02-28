import { setContactMessage, setSpamMessage } from '$lib/server/contactDB';
import { fail } from '@sveltejs/kit';

export const actions = {
	contact: async ({ request }) => {
		const form_data = await request.formData();
		// The additional field is hidden in the frontend,
		// so if a user fills it, it is considered spam as usually spambots fill all fields blindly.
		// The request is still saved in the spam table in case of false positives or for general inspection.
		if (form_data.get('additional')?.toString().length !== 0) {
			const spam = Object.fromEntries(form_data) as any;
			spam.date = new Date().toISOString();
			setSpamMessage(spam);
			return { success: true };
		}

		// Remove `additional` field before sending to verification
		form_data.delete('additional');

		const message = Object.fromEntries(form_data);

		message.date = new Date().toISOString();
		if (!verifyMessage(message)) return fail(400, { success: false });

		setContactMessage(message);
		return { success: true };
	},
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

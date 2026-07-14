import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID } from '$env/static/private';

const baseURL = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/';

type TelegramResponse =
	| { ok: true; description?: string; result: object }
	| {
			ok: false;
			description: string;
			error_code: number;
			parameters?: { migrate_to_chat_id: number; retry_after: number };
	  };

async function callMethod(
	method: string,
	body: Record<string, unknown>
): Promise<TelegramResponse> {
	const methodURL = new URL(method, baseURL);
	const jsonBody = JSON.stringify(body);
	return (await (
		await fetch(methodURL, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			body: jsonBody,
		})
	).json()) as TelegramResponse;
}

export async function sendTelegramMessage(text: string) {
	const max_text_size = 4000;
	if (text.length > max_text_size) {
		const results: TelegramResponse[] = [];
		for (let i = 0; i < text.length; i += max_text_size) {
			results.push(
				await callMethod('sendMessage', {
					chat_id: TELEGRAM_CHANNEL_ID,
					text: text.slice(i, i + max_text_size),
				})
			);
		}
		return results;
	} else return callMethod('sendMessage', { chat_id: TELEGRAM_CHANNEL_ID, text });
}

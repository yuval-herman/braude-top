import { sendTelegramMessage } from '$lib/server/telegram.js';

export const POST = async ({ request }) => {
	sendTelegramMessage(await request.text());

	return new Response(undefined, { status: 200 });
};

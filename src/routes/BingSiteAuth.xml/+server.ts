import BingSiteAuth from './BingSiteAuth.xml?raw';
import { text } from '@sveltejs/kit';

export const GET = async () => {
	return text(BingSiteAuth, {
		headers: {
			'content-type': 'application/xml',
		},
	});
};

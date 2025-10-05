import { ORIGIN } from '$env/static/private';
import { resolve } from 'url';
import { text } from '@sveltejs/kit';

const security_info = `Contact: mailto:nhajeho1@gmail.com
Expires: 2029-03-31T09:00:00.000Z
Preferred-Languages: he, en
Policy: ${resolve(ORIGIN, '/.well-known/security-policy.txt')}`;

export const GET = async () => {
	return text(security_info);
};

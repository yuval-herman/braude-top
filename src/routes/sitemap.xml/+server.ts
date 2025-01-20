import { ORIGIN } from '$env/static/private';
import { getCourses } from '$lib/server/coursesDB.js';
import { text } from '@sveltejs/kit';
import { resolve } from 'url';

const urls = ['', 'contact', 'rooms']
	.concat(
		Array.from(
			getCourses().map((c) => resolve('course/', c.course_id.toString() + `?year=${c.year}`))
		)
	)
	.map((u) => resolve(ORIGIN, u));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${u}</loc></url>`).join('')}
</urlset>`;

export const GET = async ({}) => {
	return text(sitemap, {
		headers: {
			'content-type': 'application/xml',
		},
	});
};

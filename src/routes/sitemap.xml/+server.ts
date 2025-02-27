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
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${u}</loc><changefreq>never</changefreq></url>`).join('')}
</urlset>`;

export const GET = async ({}) => {
	return text(sitemap, {
		headers: {
			'content-type': 'application/xml',
		},
	});
};

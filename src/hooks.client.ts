import { page } from '$app/state';

export const handleError = async (error) => {
	if (error.status !== 404)
		fetch(page.url.origin + '/' + page.params.institute + '/api/error', {
			method: 'post',
			body: JSON.stringify({ error: error.error, status: error.status, message: error.message }),
		});

	return {
		message: error.message,
	};
};

import { page } from '$app/state';

export const handleError = async (error) => {
	fetch(page.params.institute + '/api/error', {
		method: 'post',
		body: JSON.stringify(error),
	});

	fetch('/api/error', {
		method: 'post',
		body: JSON.stringify(error),
	});

	return {
		message: error.message,
	};
};

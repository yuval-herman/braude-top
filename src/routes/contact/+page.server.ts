export const actions = {
	contact: async ({ request }) => {
		console.log(await request.formData());
	}
};

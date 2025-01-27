export const match = (param): param is `${number}:${number}` => {
	return !!param.match(/^\d{1,2}:\d{2}$/);
};

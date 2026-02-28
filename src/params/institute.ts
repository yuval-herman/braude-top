import { INSTITUTES, type Institute } from '$lib/utils/constants.utils';

export const match = (param): param is Institute => {
	return (INSTITUTES as ReadonlyArray<string>).includes(param);
};

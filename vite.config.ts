/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import browserslist from 'browserslist';
import { browserslistToTargets, Features } from 'lightningcss';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		lightningcss: {
			targets: browserslistToTargets(browserslist('defaults')),
			exclude: Features.LightDark,
		},
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});

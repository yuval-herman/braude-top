import { expect, test } from '@playwright/test';
import { gotoMainExitHelp } from './test.utils';

test.describe('main page', () => {
	test.beforeEach(gotoMainExitHelp);

	test('expected elements exist', async ({ page }) => {});
	test('searching courses', async ({ page }) => {});
});

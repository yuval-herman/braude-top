import test from '@playwright/test';
import { gotoMainExitHelp } from './test.utils';

test.describe('main page', () => {
	test.beforeEach(gotoMainExitHelp);
});

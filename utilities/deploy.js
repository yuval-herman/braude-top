// @ts-check
import { execSync } from 'child_process';
import secrets from '../secrets.json' with { type: 'json' };

/**
 * @param {string[]} commands
 */
function runCommands(commands) {
	execSync(`ssh ${secrets.server} "${commands.join(' && ')}"`, {
		stdio: 'inherit'
	});
}

const isoTime = new Date().toISOString();

// Build app
execSync('npm run build', { stdio: 'inherit' });

runCommands([
	// Stop, backup db, and remove app from server
	'systemctl stop braude-scheduler.service',
	`mkdir ${isoTime}`,
	`mv braude-scheduler/data ${isoTime}`,
	'rm -rf braude-scheduler',

	// Recreate and copy backup into it
	'mkdir -p braude-scheduler/data',
	`cp -r ${isoTime}/data braude-scheduler`
]);

// Compress build
execSync('tar -zcf build.tar.gz build/ package.json package-lock.json');

// Copy new files to server
execSync(`scp -r build.tar.gz ${secrets.server}:/root/`, { stdio: 'inherit' });

execSync('rm build.tar.gz');

runCommands([
	'cd braude-scheduler',

	// Extract files and move build files out
	'tar -zxf ../build.tar.gz',
	'rm ../build.tar.gz',
	'mv build/* .',
	'rm -r build/',

	// Install dependencies and copy data from braude-fetcher project
	'source /root/.nvm/nvm.sh',
	'npm ci --omit dev',
	'cp ../braude-fetcher/courses.db data/',

	// Start the server
	'systemctl start braude-scheduler.service'
]);

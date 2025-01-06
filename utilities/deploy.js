// @ts-check
import { execSync } from 'child_process';
import secrets from '../secrets.json' with { type: 'json' };
import { exit } from 'process';
/**
 * @param {string[]} commands
 */
function runCommands(commands) {
	execSync(`ssh ${secrets.server} "${commands.join(' && ')}"`, {
		stdio: 'inherit'
	});
}

// Build app
execSync('npm run build', { stdio: 'inherit' });

// // Stop and remove app from server
runCommands(['systemctl stop braude-scheduler.service', 'rm -rf braude-scheduler']);

// Compress build
execSync('tar -zcf build.tar.gz build/ package.json package-lock.json');

// Copy new files to server
execSync(`scp -r build.tar.gz ${secrets.server}:/root/`, { stdio: 'inherit' });

execSync('rm build.tar.gz');

runCommands([
	// Create directory to accept files
	'mkdir braude-scheduler',
	'cd braude-scheduler',

	// Extract files and move build files out
	'tar -zxf ../build.tar.gz',
	'rm ../build.tar.gz',
	'mv build/* .',
	'rm -r build/',

	// Install dependencies and copy data from braude-fetcher project
	'source /root/.nvm/nvm.sh',
	'npm ci --omit dev',
	'mkdir data',
	'cp ../braude-fetcher/courses.db data/',

	// Start the server
	'systemctl start braude-scheduler.service'
]);

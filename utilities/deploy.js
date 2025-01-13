// @ts-check
import { execSync } from 'child_process';
import { argv } from 'process';
import secrets from '../secrets.json' with { type: 'json' };

const prod = argv[2] === 'prod';
const servicename = prod ? 'braude-scheduler' : 'braude-beta-scheduler';

/**
 * @param {string[]} commands
 */
function runCommands(commands) {
	execSync(`ssh ${secrets.server} "${commands.join(' && ')}"`, {
		stdio: 'inherit',
	});
}

const isoTime = new Date().toISOString();

// Build app
execSync('npm run build', { stdio: 'inherit' });

const backupFolder = `${prod ? 'prod' : 'beta'}-${isoTime}`;
runCommands([
	// Stop, backup db, and remove app from server
	`systemctl stop ${servicename}.service`,
	`mkdir ${backupFolder}`,
	`mv ${servicename}/data ${backupFolder}`,
	`rm -rf ${servicename}`,

	// Recreate and copy backup into it
	`mkdir -p ${servicename}/data`,
	`cp -r ${backupFolder}/data ${servicename}`,
]);

// Compress build
execSync('tar -zcf build.tar.gz build/ package.json package-lock.json');

// Copy new files to server
execSync(`scp -r build.tar.gz ${secrets.server}:/root/`, { stdio: 'inherit' });

execSync('rm build.tar.gz');

runCommands([
	`cd ${servicename}`,

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
	`systemctl start ${servicename}.service`,
]);

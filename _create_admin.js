'use strict';

const path = require('path');
const nconf = require('nconf');

nconf.file({ file: path.join(__dirname, 'config.json') });
nconf.defaults({
	base_dir: __dirname,
	upload_path: path.join(__dirname, 'public/uploads'),
	views_dir: path.join(__dirname, 'build/public/templates'),
	version: '0.0.0',
});

const db = require('./src/database');
db.init(async function (err) {
	if (err) { console.error(err); process.exit(1); }
	await db.initSessionStore();
	const user = require('./src/user');
	const groups = require('./src/groups');
	const uid = await user.getUidByUsername('maxwell2');
	if (!uid) { console.error('User "maxwell2" not found'); process.exit(1); }
	await groups.join('administrators', uid);
	console.log('maxwell2 (uid:', uid, ') is now an admin');
	process.exit(0);
});

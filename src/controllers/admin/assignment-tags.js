'use strict';

const nconf = require('nconf');

const assignmentTagsController = module.exports;

assignmentTagsController.get = async function (req, res) {
	// Check if using PostgreSQL
	if (nconf.get('database') !== 'postgres') {
		return res.render('admin/manage/assignment-tags', {
			tags: [],
			postgresOnly: true,
		});
	}

	try {
		const assignmentTags = require('../../assignment-tags');
		const tags = await assignmentTags.getAll();
		res.render('admin/manage/assignment-tags', {
			tags: tags,
			postgresOnly: false,
		});
	} catch (err) {
		res.render('admin/manage/assignment-tags', {
			tags: [],
			error: err.message,
		});
	}
};

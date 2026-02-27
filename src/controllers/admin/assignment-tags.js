'use strict';

const assignmentTags = require('../../assignment-tags');

const assignmentTagsController = module.exports;

assignmentTagsController.get = async function (req, res) {
	try {
		const tags = await assignmentTags.getAll();
		res.render('admin/manage/assignment-tags', {
			tags: tags,
		});
	} catch (err) {
		res.render('admin/manage/assignment-tags', {
			tags: [],
			error: err.message,
		});
	}
};

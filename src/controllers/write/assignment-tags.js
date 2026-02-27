'use strict';

const api = require('../../api');
const helpers = require('../helpers');

const AssignmentTags = module.exports;

/**
 * Create a new tag
 * POST /api/v3/tags
 */
AssignmentTags.create = async (req, res) => {
	const tag = await api.assignmentTags.create(req, req.body);
	helpers.formatApiResponse(200, res, tag);
};

/**
 * List all tags
 * GET /api/v3/tags
 */
AssignmentTags.list = async (req, res) => {
	const tags = await api.assignmentTags.list(req);
	helpers.formatApiResponse(200, res, tags);
};

/**
 * Get a single tag
 * GET /api/v3/tags/:id
 */
AssignmentTags.get = async (req, res) => {
	const tag = await api.assignmentTags.get(req, { id: req.params.id });
	helpers.formatApiResponse(200, res, tag);
};

/**
 * Update a tag
 * PUT /api/v3/tags/:id
 */
AssignmentTags.update = async (req, res) => {
	const tag = await api.assignmentTags.update(req, {
		id: req.params.id,
		...req.body,
	});
	helpers.formatApiResponse(200, res, tag);
};

/**
 * Delete a tag
 * DELETE /api/v3/tags/:id
 */
AssignmentTags.delete = async (req, res) => {
	await api.assignmentTags.delete(req, { id: req.params.id });
	helpers.formatApiResponse(200, res);
};

/**
 * Add tag to post
 * POST /api/v3/posts/:pid/tags/:tagId
 */
AssignmentTags.addToPost = async (req, res) => {
	const tags = await api.assignmentTags.addToPost(req, {
		pid: req.params.pid,
		tagId: req.params.tagId,
	});
	helpers.formatApiResponse(200, res, tags);
};

/**
 * Remove tag from post
 * DELETE /api/v3/posts/:pid/tags/:tagId
 */
AssignmentTags.removeFromPost = async (req, res) => {
	const tags = await api.assignmentTags.removeFromPost(req, {
		pid: req.params.pid,
		tagId: req.params.tagId,
	});
	helpers.formatApiResponse(200, res, tags);
};

/**
 * Get all tags for a post
 * GET /api/v3/posts/:pid/tags
 */
AssignmentTags.getPostTags = async (req, res) => {
	const tags = await api.assignmentTags.getPostTags(req, { pid: req.params.pid });
	helpers.formatApiResponse(200, res, tags);
};

/**
 * Set all tags for a post
 * PUT /api/v3/posts/:pid/tags
 */
AssignmentTags.setPostTags = async (req, res) => {
	const tags = await api.assignmentTags.setPostTags(req, {
		pid: req.params.pid,
		tagIds: req.body.tagIds,
	});
	helpers.formatApiResponse(200, res, tags);
};

/**
 * Get all posts with a tag
 * GET /api/v3/tags/:id/posts
 */
AssignmentTags.getTagPosts = async (req, res) => {
	const posts = await api.assignmentTags.getTagPosts(req, { id: req.params.id });
	helpers.formatApiResponse(200, res, posts);
};

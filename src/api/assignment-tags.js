'use strict';

const assignmentTags = require('../assignment-tags');
const privileges = require('../privileges');
const groups = require('../groups');

const assignmentTagsAPI = module.exports;

/**
 * Check if user is an instructor (member of 'instructors' group) or admin
 */
async function isInstructorOrAdmin(uid) {
	const [isAdmin, isInstructor] = await Promise.all([
		privileges.users.isAdministrator(uid),
		groups.isMember(uid, 'instructors'),
	]);
	return isAdmin || isInstructor;
}

/**
 * Create a new assignment tag
 * POST /api/v3/tags
 */
assignmentTagsAPI.create = async function (caller, data) {
	const canCreate = await isInstructorOrAdmin(caller.uid);
	if (!canCreate) {
		throw new Error('[[error:no-privileges]]');
	}

	if (!data.name) {
		throw new Error('[[error:invalid-data]]');
	}

	return await assignmentTags.create({
		name: data.name,
		color: data.color,
		category: data.category,
	});
};

/**
 * Get all assignment tags
 * GET /api/v3/tags
 */
assignmentTagsAPI.list = async function (caller) {
	// All authenticated users can view tags
	if (parseInt(caller.uid, 10) <= 0) {
		throw new Error('[[error:not-logged-in]]');
	}

	return await assignmentTags.getAll();
};

/**
 * Get a single tag by ID
 * GET /api/v3/tags/:id
 */
assignmentTagsAPI.get = async function (caller, data) {
	if (parseInt(caller.uid, 10) <= 0) {
		throw new Error('[[error:not-logged-in]]');
	}

	if (!data.id) {
		throw new Error('[[error:invalid-data]]');
	}

	const tag = await assignmentTags.get(data.id);
	if (!tag) {
		throw new Error('[[error:no-tag]]');
	}

	return tag;
};

/**
 * Update an assignment tag
 * PUT /api/v3/tags/:id
 */
assignmentTagsAPI.update = async function (caller, data) {
	const canUpdate = await isInstructorOrAdmin(caller.uid);
	if (!canUpdate) {
		throw new Error('[[error:no-privileges]]');
	}

	if (!data.id) {
		throw new Error('[[error:invalid-data]]');
	}

	return await assignmentTags.update(data.id, {
		name: data.name,
		color: data.color,
		category: data.category,
	});
};

/**
 * Delete an assignment tag
 * DELETE /api/v3/tags/:id
 */
assignmentTagsAPI.delete = async function (caller, data) {
	const canDelete = await isInstructorOrAdmin(caller.uid);
	if (!canDelete) {
		throw new Error('[[error:no-privileges]]');
	}

	if (!data.id) {
		throw new Error('[[error:invalid-data]]');
	}

	await assignmentTags.delete(data.id);
};

/**
 * Add tag to a post
 * POST /api/v3/posts/:pid/tags/:tagId
 */
assignmentTagsAPI.addToPost = async function (caller, data) {
	const canEdit = await isInstructorOrAdmin(caller.uid);
	if (!canEdit) {
		throw new Error('[[error:no-privileges]]');
	}

	if (!data.pid || !data.tagId) {
		throw new Error('[[error:invalid-data]]');
	}

	await assignmentTags.addToPost(data.pid, data.tagId);
	return await assignmentTags.getPostTags(data.pid);
};

/**
 * Remove tag from a post
 * DELETE /api/v3/posts/:pid/tags/:tagId
 */
assignmentTagsAPI.removeFromPost = async function (caller, data) {
	const canEdit = await isInstructorOrAdmin(caller.uid);
	if (!canEdit) {
		throw new Error('[[error:no-privileges]]');
	}

	if (!data.pid || !data.tagId) {
		throw new Error('[[error:invalid-data]]');
	}

	await assignmentTags.removeFromPost(data.pid, data.tagId);
	return await assignmentTags.getPostTags(data.pid);
};

/**
 * Get all tags for a post
 * GET /api/v3/posts/:pid/tags
 */
assignmentTagsAPI.getPostTags = async function (caller, data) {
	if (parseInt(caller.uid, 10) <= 0) {
		throw new Error('[[error:not-logged-in]]');
	}

	if (!data.pid) {
		throw new Error('[[error:invalid-data]]');
	}

	return await assignmentTags.getPostTags(data.pid);
};

/**
 * Set all tags for a post (replaces existing)
 * PUT /api/v3/posts/:pid/tags
 */
assignmentTagsAPI.setPostTags = async function (caller, data) {
	const canEdit = await isInstructorOrAdmin(caller.uid);
	if (!canEdit) {
		throw new Error('[[error:no-privileges]]');
	}

	if (!data.pid || !Array.isArray(data.tagIds)) {
		throw new Error('[[error:invalid-data]]');
	}

	await assignmentTags.setPostTags(data.pid, data.tagIds);
	return await assignmentTags.getPostTags(data.pid);
};

/**
 * Get all posts with a specific tag
 * GET /api/v3/tags/:id/posts
 */
assignmentTagsAPI.getTagPosts = async function (caller, data) {
	if (parseInt(caller.uid, 10) <= 0) {
		throw new Error('[[error:not-logged-in]]');
	}

	if (!data.id) {
		throw new Error('[[error:invalid-data]]');
	}

	return await assignmentTags.getTagPosts(data.id);
};

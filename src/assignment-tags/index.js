'use strict';

const db = require('../database');

const AssignmentTags = module.exports;

/**
 * Create a new assignment tag
 */
AssignmentTags.create = async function (data) {
	if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
		throw new Error('[[error:invalid-tag-name]]');
	}

	const id = await db.incrObjectField('global', 'nextAssignmentTagId');
	const timestamp = Date.now();
	const tagData = {
		id: id,
		name: data.name.trim(),
		color: data.color || '#3498db',
		category: data.category || '',
		timestamp: timestamp,
	};

	await Promise.all([
		db.setObject(`assignment-tag:${id}`, tagData),
		db.sortedSetAdd('assignment-tags:all', timestamp, id),
	]);

	return tagData;
};

/**
 * Get a tag by ID
 */
AssignmentTags.get = async function (tagId) {
	const tagData = await db.getObject(`assignment-tag:${tagId}`);
	return tagData || null;
};

/**
 * Get all tags
 */
AssignmentTags.getAll = async function () {
	const tagIds = await db.getSortedSetRange('assignment-tags:all', 0, -1);
	if (!tagIds.length) {
		return [];
	}
	const keys = tagIds.map(id => `assignment-tag:${id}`);
	const tags = await db.getObjects(keys);
	return tags.filter(Boolean);
};

/**
 * Update a tag
 */
AssignmentTags.update = async function (tagId, data) {
	const exists = await AssignmentTags.exists(tagId);
	if (!exists) {
		throw new Error('[[error:no-tag]]');
	}

	const updates = {};
	if (data.name !== undefined) {
		if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
			throw new Error('[[error:invalid-tag-name]]');
		}
		updates.name = data.name.trim();
	}
	if (data.color !== undefined) {
		updates.color = data.color;
	}
	if (data.category !== undefined) {
		updates.category = data.category || '';
	}

	if (Object.keys(updates).length > 0) {
		await db.setObject(`assignment-tag:${tagId}`, updates);
	}

	return await AssignmentTags.get(tagId);
};

/**
 * Delete a tag and clean up all relationships
 */
AssignmentTags.delete = async function (tagId) {
	const tagData = await AssignmentTags.get(tagId);
	if (!tagData) {
		throw new Error('[[error:no-tag]]');
	}

	// Get all posts that have this tag and remove from both sides
	const pids = await db.getSortedSetMembers(`assignment-tag:${tagId}:posts`);
	if (pids.length) {
		const removeKeys = pids.map(pid => `post:${pid}:assignment-tags`);
		await db.sortedSetsRemove(removeKeys, tagId);
	}

	await Promise.all([
		db.delete(`assignment-tag:${tagId}`),
		db.delete(`assignment-tag:${tagId}:posts`),
		db.sortedSetRemove('assignment-tags:all', tagId),
	]);

	return tagData;
};

/**
 * Check if tag exists
 */
AssignmentTags.exists = async function (tagId) {
	return await db.exists(`assignment-tag:${tagId}`);
};

/**
 * Add tag to a post
 */
AssignmentTags.addToPost = async function (postId, tagId) {
	const timestamp = Date.now();
	await Promise.all([
		db.sortedSetAdd(`post:${postId}:assignment-tags`, timestamp, tagId),
		db.sortedSetAdd(`assignment-tag:${tagId}:posts`, timestamp, postId),
	]);
};

/**
 * Remove tag from a post
 */
AssignmentTags.removeFromPost = async function (postId, tagId) {
	await Promise.all([
		db.sortedSetRemove(`post:${postId}:assignment-tags`, tagId),
		db.sortedSetRemove(`assignment-tag:${tagId}:posts`, postId),
	]);
};

/**
 * Get all tags for a post
 */
AssignmentTags.getPostTags = async function (postId) {
	const tagIds = await db.getSortedSetMembers(`post:${postId}:assignment-tags`);
	if (!tagIds.length) {
		return [];
	}
	const keys = tagIds.map(id => `assignment-tag:${id}`);
	const tags = await db.getObjects(keys);
	return tags.filter(Boolean);
};

/**
 * Get all posts for a tag
 */
AssignmentTags.getTagPosts = async function (tagId) {
	return await db.getSortedSetRevRange(`assignment-tag:${tagId}:posts`, 0, -1);
};

/**
 * Set tags for a post (replaces all existing tags)
 */
AssignmentTags.setPostTags = async function (postId, tagIds) {
	// Remove all existing tags for this post
	const existingTagIds = await db.getSortedSetMembers(`post:${postId}:assignment-tags`);
	if (existingTagIds.length) {
		const removeFromTagKeys = existingTagIds.map(id => `assignment-tag:${id}:posts`);
		await Promise.all([
			db.delete(`post:${postId}:assignment-tags`),
			db.sortedSetsRemove(removeFromTagKeys, postId),
		]);
	}

	// Add new tags
	if (tagIds && tagIds.length > 0) {
		const timestamp = Date.now();
		const addToPostBulk = tagIds.map(tagId => [`post:${postId}:assignment-tags`, timestamp, tagId]);
		const addToTagBulk = tagIds.map(tagId => [`assignment-tag:${tagId}:posts`, timestamp, postId]);
		await db.sortedSetAddBulk([...addToPostBulk, ...addToTagBulk]);
	}
};

/**
 * Filter posts by assignment tags (OR operation)
 */
AssignmentTags.filterPostsByTags = async function (pids, tagIds) {
	if (!Array.isArray(pids) || !pids.length || !Array.isArray(tagIds) || !tagIds.length) {
		return pids;
	}

	// Get all post IDs that have any of the specified tags
	const tagPostKeys = tagIds.map(id => `assignment-tag:${id}:posts`);
	const tagPostArrays = await db.getSortedSetsMembers(tagPostKeys);

	// Flatten and deduplicate
	const matchingPids = new Set();
	tagPostArrays.forEach((postIds) => {
		postIds.forEach(pid => matchingPids.add(String(pid)));
	});

	// Intersect with input pids
	return pids.filter(pid => matchingPids.has(String(pid)));
};

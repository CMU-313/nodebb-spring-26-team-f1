'use strict';

const nconf = require('nconf');
const db = require('../database');

const AssignmentTags = module.exports;

/**
 * Create a new assignment tag
 */
AssignmentTags.create = async function (data) {
	if (nconf.get('database') !== 'postgres') {
		throw new Error('[[error:assignment-tags-postgres-only]]');
	}

	if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
		throw new Error('[[error:invalid-tag-name]]');
	}

	const result = await db.pool.query(
		'INSERT INTO assignment_tags (name, color, category) VALUES ($1, $2, $3) RETURNING *',
		[data.name.trim(), data.color || '#3498db', data.category || null]
	);

	return result.rows[0];
};

/**
 * Get a tag by ID
 */
AssignmentTags.get = async function (tagId) {
	if (nconf.get('database') !== 'postgres') {
		throw new Error('[[error:assignment-tags-postgres-only]]');
	}

	const result = await db.pool.query(
		'SELECT * FROM assignment_tags WHERE id = $1',
		[tagId]
	);

	return result.rows[0] || null;
};

/**
 * Get all tags
 */
AssignmentTags.getAll = async function () {
	if (nconf.get('database') !== 'postgres') {
		throw new Error('[[error:assignment-tags-postgres-only]]');
	}

	const result = await db.pool.query(
		'SELECT * FROM assignment_tags ORDER BY name ASC'
	);

	return result.rows;
};

/**
 * Update a tag
 */
AssignmentTags.update = async function (tagId, data) {
	if (nconf.get('database') !== 'postgres') {
		throw new Error('[[error:assignment-tags-postgres-only]]');
	}

	const updates = [];
	const values = [];
	let paramCount = 1;

	if (data.name !== undefined) {
		if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
			throw new Error('[[error:invalid-tag-name]]');
		}
		updates.push(`name = $${paramCount++}`);
		values.push(data.name.trim());
	}

	if (data.color !== undefined) {
		updates.push(`color = $${paramCount++}`);
		values.push(data.color);
	}

	if (data.category !== undefined) {
		updates.push(`category = $${paramCount++}`);
		values.push(data.category || null);
	}

	if (updates.length === 0) {
		return await AssignmentTags.get(tagId);
	}

	updates.push(`updated_at = NOW()`);
	values.push(tagId);

	const result = await db.pool.query(
		`UPDATE assignment_tags SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
		values
	);

	if (result.rows.length === 0) {
		throw new Error('[[error:no-tag]]');
	}

	return result.rows[0];
};

/**
 * Delete a tag (cascade deletes from post_tags via foreign key)
 */
AssignmentTags.delete = async function (tagId) {
	if (nconf.get('database') !== 'postgres') {
		throw new Error('[[error:assignment-tags-postgres-only]]');
	}

	const result = await db.pool.query(
		'DELETE FROM assignment_tags WHERE id = $1 RETURNING *',
		[tagId]
	);

	if (result.rows.length === 0) {
		throw new Error('[[error:no-tag]]');
	}

	return result.rows[0];
};

/**
 * Check if tag exists
 */
AssignmentTags.exists = async function (tagId) {
	if (nconf.get('database') !== 'postgres') {
		return false;
	}

	const result = await db.pool.query(
		'SELECT EXISTS(SELECT 1 FROM assignment_tags WHERE id = $1)',
		[tagId]
	);

	return result.rows[0].exists;
};

/**
 * Add tag to a post
 */
AssignmentTags.addToPost = async function (postId, tagId) {
	if (nconf.get('database') !== 'postgres') {
		throw new Error('[[error:assignment-tags-postgres-only]]');
	}

	await db.pool.query(
		'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
		[postId, tagId]
	);
};

/**
 * Remove tag from a post
 */
AssignmentTags.removeFromPost = async function (postId, tagId) {
	if (nconf.get('database') !== 'postgres') {
		throw new Error('[[error:assignment-tags-postgres-only]]');
	}

	await db.pool.query(
		'DELETE FROM post_tags WHERE post_id = $1 AND tag_id = $2',
		[postId, tagId]
	);
};

/**
 * Get all tags for a post
 */
AssignmentTags.getPostTags = async function (postId) {
	if (nconf.get('database') !== 'postgres') {
		throw new Error('[[error:assignment-tags-postgres-only]]');
	}

	const result = await db.pool.query(
		`SELECT at.* FROM assignment_tags at
		 INNER JOIN post_tags pt ON at.id = pt.tag_id
		 WHERE pt.post_id = $1
		 ORDER BY at.name ASC`,
		[postId]
	);

	return result.rows;
};

/**
 * Get all posts for a tag
 */
AssignmentTags.getTagPosts = async function (tagId) {
	if (nconf.get('database') !== 'postgres') {
		throw new Error('[[error:assignment-tags-postgres-only]]');
	}

	const result = await db.pool.query(
		'SELECT post_id FROM post_tags WHERE tag_id = $1 ORDER BY created_at DESC',
		[tagId]
	);

	return result.rows.map(row => row.post_id);
};

/**
 * Set tags for a post (replaces all existing tags)
 */
AssignmentTags.setPostTags = async function (postId, tagIds) {
	if (nconf.get('database') !== 'postgres') {
		throw new Error('[[error:assignment-tags-postgres-only]]');
	}

	const client = await db.pool.connect();
	try {
		await client.query('BEGIN');

		// Remove all existing tags for this post
		await client.query('DELETE FROM post_tags WHERE post_id = $1', [postId]);

		// Add new tags
		if (tagIds && tagIds.length > 0) {
			const values = tagIds.map((tagId, i) => `($1, $${i + 2})`).join(', ');
			const params = [postId, ...tagIds];
			await client.query(
				`INSERT INTO post_tags (post_id, tag_id) VALUES ${values} ON CONFLICT DO NOTHING`,
				params
			);
		}

		await client.query('COMMIT');
	} catch (err) {
		await client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
};

/**
 * Filter posts by assignment tags
 * @param {Array<number>} pids - Array of post IDs to filter
 * @param {Array<number>} tagIds - Array of tag IDs to filter by (OR operation)
 * @returns {Promise<Array<number>>} - Filtered post IDs
 */
AssignmentTags.filterPostsByTags = async function (pids, tagIds) {
	if (nconf.get('database') !== 'postgres') {
		return pids; // Return all pids if not using PostgreSQL
	}

	if (!Array.isArray(pids) || !pids.length || !Array.isArray(tagIds) || !tagIds.length) {
		return pids;
	}

	const placeholders = tagIds.map((_, i) => `$${i + 1}`).join(', ');
	const result = await db.pool.query(
		`SELECT DISTINCT post_id FROM post_tags
		 WHERE tag_id IN (${placeholders})
		 AND post_id = ANY($${tagIds.length + 1})`,
		[...tagIds, pids]
	);

	return result.rows.map(row => row.post_id);
};

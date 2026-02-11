'use strict';

const db = require('../database');
const privileges = require('../privileges');

module.exports = function (Topics) {
	/**
	 * Checks if a user should have auto-resolution privileges (admin or moderator)
	 * @param {number} uid - User ID
	 * @param {number} cid - Category ID
	 * @returns {Promise<boolean>} True if user can auto-resolve topics
	 */
	Topics.canAutoResolve = async function (uid, cid) {
		// Must be a valid user (uid > 0)
		if (!parseInt(uid, 10) > 0) {
			return false;
		}

		// Check if user is admin or moderator of the category
		const [isAdmin, isModerator] = await Promise.all([
			privileges.users.isAdministrator(uid),
			privileges.users.isModerator(uid, cid),
		]);

		return isAdmin || isModerator;
	};

	/**
	 * Get the role information for a user in a category
	 * @param {number} uid - User ID
	 * @param {number} cid - Category ID
	 * @returns {Promise<string>} Role of the user ('admin', 'moderator', or 'user')
	 */
	Topics.getUserRoleInCategory = async function (uid, cid) {
		// Must be a valid user (uid > 0)
		if (!parseInt(uid, 10) > 0) {
			return 'guest';
		}

		const isAdmin = await privileges.users.isAdministrator(uid);
		if (isAdmin) {
			return 'admin';
		}

		const isModerator = await privileges.users.isModerator(uid, cid);
		if (isModerator) {
			return 'moderator';
		}

		return 'user';
	};

	/**
	 * Mark a topic as resolved
	 * @param {number} tid - Topic ID
	 * @param {number} uid - User ID who is resolving
	 * @param {number} cid - Category ID
	 * @returns {Promise<void>}
	 */
	Topics.markAsResolved = async function (tid, uid, cid) {
		const timestamp = Date.now();
		const role = await Topics.getUserRoleInCategory(uid, cid);

		const resolvedByData = {
			uid: uid,
			role: role,
		};

		await db.setObject(`topic:${tid}`, {
			isResolved: 1,
			resolvedAt: timestamp,
			resolvedBy: JSON.stringify(resolvedByData),
		});
	};

	/**
	 * Mark a topic as unresolved
	 * @param {number} tid - Topic ID
	 * @returns {Promise<void>}
	 */
	Topics.markAsUnresolved = async function (tid) {
		await Promise.all([
			db.setObject(`topic:${tid}`, { isResolved: 0 }),
			db.deleteObjectFields(`topic:${tid}`, ['resolvedAt', 'resolvedBy']),
		]);
	};

	/**
	 * Auto-resolve a topic when an instructor/TA (admin/moderator) replies
	 * This is called during post creation
	 * @param {number} tid - Topic ID
	 * @param {number} uid - User ID who posted
	 * @param {number} cid - Category ID
	 * @returns {Promise<void>}
	 */
	Topics.autoResolveIfNeeded = async function (tid, uid, cid) {
		// Check if user has auto-resolve privileges
		const canResolve = await Topics.canAutoResolve(uid, cid);
		if (!canResolve) {
			return;
		}

		// Get current topic state
		const topicData = await Topics.getTopicFields(tid, ['isResolved']);
		if (!topicData) {
			return;
		}

		// Only resolve if not already resolved
		if (!topicData.isResolved) {
			await Topics.markAsResolved(tid, uid, cid);
		}
	};
};

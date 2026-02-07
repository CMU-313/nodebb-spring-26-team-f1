'use strict';

const assert = require('assert');
const db = require('../database');
const topics = require('../topics');
const posts = require('../posts');
const privileges = require('../privileges');
const user = require('../user');

describe('Topic Resolution Feature', () => {
	let studentUid;
	let moderatorUid;
	let adminUid;
	let testCid;
	let testTid;

	before(async () => {
		// Create test users
		studentUid = await user.create({ username: 'student-user', password: 'password123' });
		moderatorUid = await user.create({ username: 'moderator-user', password: 'password123' });
		adminUid = await user.create({ username: 'admin-user', password: 'password123' });

		// Set moderator privileges
		await privileges.users.makeAdministrator(adminUid);
		
		// Create test category
		const category = await require('../categories').create({
			name: 'Test Category',
			description: 'Category for resolution tests',
		});
		testCid = category.cid;

		// Grant moderator privilege to moderatorUid in test category
		await privileges.categories.give(['edit', 'topics:create', 'posts:create'], testCid, [moderatorUid]);
	});

	describe('Schema Initialization', () => {
		it('should initialize resolution fields when creating a new topic', async () => {
			testTid = await topics.create({
				uid: studentUid,
				cid: testCid,
				title: 'Test Topic for Resolution',
				content: 'This is a test topic',
			});

			const topicData = await topics.getTopicFields(testTid, ['isResolved', 'resolvedAt', 'resolvedBy']);

			assert.strictEqual(topicData.isResolved, 0, 'New topic should not be resolved');
			assert.strictEqual(topicData.resolvedAt, null, 'New topic should have null resolvedAt');
			assert.strictEqual(topicData.resolvedBy, null, 'New topic should have null resolvedBy');
		});

		it('should have resolution fields available after migration', async () => {
			const topicData = await topics.getTopicData(testTid);
			assert(topicData.hasOwnProperty('isResolved'), 'Topic should have isResolved field');
			assert(topicData.hasOwnProperty('resolvedAt'), 'Topic should have resolvedAt field');
			assert(topicData.hasOwnProperty('resolvedBy'), 'Topic should have resolvedBy field');
		});
	});

	describe('Auto-Resolution Triggers', () => {
		it('should NOT auto-resolve when student replies', async () => {
			// Student creates a reply
			await posts.create({
				uid: studentUid,
				tid: testTid,
				content: 'Student reply to topic',
			});

			// Check topic is still unresolved
			const topicData = await topics.getTopicFields(testTid, ['isResolved', 'resolvedAt', 'resolvedBy']);
			assert.strictEqual(topicData.isResolved, 0, 'Topic should remain unresolved after student reply');
			assert.strictEqual(topicData.resolvedAt, null, 'resolvedAt should remain null');
			assert.strictEqual(topicData.resolvedBy, null, 'resolvedBy should remain null');
		});

		it('should auto-resolve when moderator replies', async () => {
			// Create new topic for this test
			const newTid = await topics.create({
				uid: studentUid,
				cid: testCid,
				title: 'Test Topic for Moderator Reply',
				content: 'Test topic content',
			});

			// Moderator creates a reply
			await posts.create({
				uid: moderatorUid,
				tid: newTid,
				content: 'Moderator response to topic',
			});

			// Check topic is resolved
			const topicData = await topics.getTopicFields(newTid, ['isResolved', 'resolvedAt', 'resolvedBy']);
			assert.strictEqual(topicData.isResolved, 1, 'Topic should be resolved after moderator reply');
			assert(topicData.resolvedAt !== null, 'resolvedAt should be set');
			assert(topicData.resolvedBy !== null, 'resolvedBy should be set');

			// Verify resolvedBy data
			const resolvedByData = JSON.parse(topicData.resolvedBy);
			assert.strictEqual(resolvedByData.uid, moderatorUid, 'resolvedBy uid should match moderator uid');
			assert.strictEqual(resolvedByData.role, 'moderator', 'resolvedBy role should be moderator');
		});

		it('should auto-resolve when admin replies', async () => {
			// Create new topic for this test
			const newTid = await topics.create({
				uid: studentUid,
				cid: testCid,
				title: 'Test Topic for Admin Reply',
				content: 'Test topic content',
			});

			// Admin creates a reply
			await posts.create({
				uid: adminUid,
				tid: newTid,
				content: 'Admin response to topic',
			});

			// Check topic is resolved
			const topicData = await topics.getTopicFields(newTid, ['isResolved', 'resolvedAt', 'resolvedBy']);
			assert.strictEqual(topicData.isResolved, 1, 'Topic should be resolved after admin reply');
			assert(topicData.resolvedAt !== null, 'resolvedAt should be set');
			assert(topicData.resolvedBy !== null, 'resolvedBy should be set');

			// Verify resolvedBy data
			const resolvedByData = JSON.parse(topicData.resolvedBy);
			assert.strictEqual(resolvedByData.uid, adminUid, 'resolvedBy uid should match admin uid');
			assert.strictEqual(resolvedByData.role, 'admin', 'resolvedBy role should be admin');
		});

		it('should NOT auto-resolve again if already resolved', async () => {
			// Create new topic
			const newTid = await topics.create({
				uid: studentUid,
				cid: testCid,
				title: 'Test Topic for Re-resolve Check',
				content: 'Test topic content',
			});

			// First moderator reply should resolve
			await posts.create({
				uid: moderatorUid,
				tid: newTid,
				content: 'First moderator response',
			});

			const firstResolve = await topics.getTopicFields(newTid, ['resolvedAt', 'resolvedBy']);
			const firstResolveData = JSON.parse(firstResolve.resolvedBy);

			// Wait a bit to ensure timestamp would be different
			await new Promise(resolve => setTimeout(resolve, 100));

			// Another moderator reply should NOT change resolution timestamp
			await posts.create({
				uid: moderatorUid,
				tid: newTid,
				content: 'Second moderator response',
			});

			const secondResolve = await topics.getTopicFields(newTid, ['resolvedAt', 'resolvedBy']);
			const secondResolveData = JSON.parse(secondResolve.resolvedBy);

			// Verify resolution data hasn't changed
			assert.strictEqual(firstResolve.resolvedAt, secondResolve.resolvedAt, 'resolvedAt should not change');
			assert.deepStrictEqual(firstResolveData, secondResolveData, 'resolvedBy should not change');
		});
	});

	describe('Helper Functions', () => {
		it('Topics.canAutoResolve should return false for students', async () => {
			const canResolve = await topics.canAutoResolve(studentUid, testCid);
			assert.strictEqual(canResolve, false, 'Students should not be able to auto-resolve');
		});

		it('Topics.canAutoResolve should return true for moderators', async () => {
			const canResolve = await topics.canAutoResolve(moderatorUid, testCid);
			assert.strictEqual(canResolve, true, 'Moderators should be able to auto-resolve');
		});

		it('Topics.canAutoResolve should return true for admins', async () => {
			const canResolve = await topics.canAutoResolve(adminUid, testCid);
			assert.strictEqual(canResolve, true, 'Admins should be able to auto-resolve');
		});

		it('Topics.getUserRoleInCategory should return correct role for student', async () => {
			const role = await topics.getUserRoleInCategory(studentUid, testCid);
			assert.strictEqual(role, 'user', 'Student should have "user" role');
		});

		it('Topics.getUserRoleInCategory should return correct role for moderator', async () => {
			const role = await topics.getUserRoleInCategory(moderatorUid, testCid);
			assert.strictEqual(role, 'moderator', 'Moderator should have "moderator" role');
		});

		it('Topics.getUserRoleInCategory should return correct role for admin', async () => {
			const role = await topics.getUserRoleInCategory(adminUid, testCid);
			assert.strictEqual(role, 'admin', 'Admin should have "admin" role');
		});

		it('Topics.markAsResolved should manually mark topic as resolved', async () => {
			// Create new topic
			const newTid = await topics.create({
				uid: studentUid,
				cid: testCid,
				title: 'Topic to Manually Resolve',
				content: 'Test content',
			});

			// Manually mark as resolved
			await topics.markAsResolved(newTid, moderatorUid, testCid);

			// Verify
			const topicData = await topics.getTopicFields(newTid, ['isResolved', 'resolvedAt', 'resolvedBy']);
			assert.strictEqual(topicData.isResolved, 1, 'Topic should be marked as resolved');
			assert(topicData.resolvedAt !== null, 'resolvedAt should be set');

			const resolvedByData = JSON.parse(topicData.resolvedBy);
			assert.strictEqual(resolvedByData.uid, moderatorUid, 'Correct uid should be recorded');
		});

		it('Topics.markAsUnresolved should reset resolution status', async () => {
			// Create new topic and resolve it
			const newTid = await topics.create({
				uid: studentUid,
				cid: testCid,
				title: 'Topic to Unresolve',
				content: 'Test content',
			});

			await topics.markAsResolved(newTid, moderatorUid, testCid);

			// Now unresolve it
			await topics.markAsUnresolved(newTid);

			// Verify
			const topicData = await topics.getTopicFields(newTid, ['isResolved', 'resolvedAt', 'resolvedBy']);
			assert.strictEqual(topicData.isResolved, 0, 'Topic should be unresolved');
			assert.strictEqual(topicData.resolvedAt, null, 'resolvedAt should be null');
			assert.strictEqual(topicData.resolvedBy, null, 'resolvedBy should be null');
		});
	});

	describe('Edge Cases', () => {
		it('should handle guest users (uid = 0) gracefully', async () => {
			const canResolve = await topics.canAutoResolve(0, testCid);
			assert.strictEqual(canResolve, false, 'Guests should not be able to auto-resolve');
		});

		it('should handle invalid topic IDs gracefully', async () => {
			// Should not throw when autoResolveIfNeeded is called with invalid tid
			try {
				await topics.autoResolveIfNeeded(999999, moderatorUid, testCid);
				// No assertion needed - just verify it doesn't throw
			} catch (e) {
				assert.fail('autoResolveIfNeeded should not throw for invalid topic');
			}
		});

		it('should persist resolution data correctly', async () => {
			// Create topic
			const newTid = await topics.create({
				uid: studentUid,
				cid: testCid,
				title: 'Persistence Test Topic',
				content: 'Test content',
			});

			// Auto-resolve via moderator reply
			await posts.create({
				uid: moderatorUid,
				tid: newTid,
				content: 'Moderator response',
			});

			// Fetch and verify immediately
			const resolveData1 = await topics.getTopicFields(newTid, ['isResolved', 'resolvedAt', 'resolvedBy']);
			assert.strictEqual(resolveData1.isResolved, 1, 'Should be resolved');

			// Fetch again to verify data persists
			const resolveData2 = await topics.getTopicFields(newTid, ['isResolved', 'resolvedAt', 'resolvedBy']);
			assert.strictEqual(resolveData2.isResolved, resolveData1.isResolved, 'Resolution status should persist');
			assert.strictEqual(resolveData2.resolvedAt, resolveData1.resolvedAt, 'Resolution timestamp should persist');
			assert.strictEqual(resolveData2.resolvedBy, resolveData1.resolvedBy, 'Resolution info should persist');
		});
	});

	after(async () => {
		// Cleanup is handled by test framework
	});
});

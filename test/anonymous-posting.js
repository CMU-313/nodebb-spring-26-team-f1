'use strict';

const assert = require('assert');
const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const posts = require('../src/posts');
const categories = require('../src/categories');
const privileges = require('../src/privileges');
const groups = require('../src/groups');
const user = require('../src/user');

describe('Anonymous Posting Feature', () => {
	let studentUid;
	let instructorUid;
	let adminUid;
	let testCid;

	before(async () => {
		// Create test users
		studentUid = await user.create({ username: 'anon-student', password: 'password123' });
		instructorUid = await user.create({ username: 'anon-instructor', password: 'password123' });
		adminUid = await user.create({ username: 'anon-admin', password: 'password123' });

		// Make admin user an administrator
		await groups.join('administrators', adminUid);

		// Create test category
		const category = await categories.create({
			name: 'Anonymous Test Category',
			description: 'Category for anonymous posting tests',
		});
		testCid = category.cid;

		// Grant moderator privilege to instructor in test category
		await privileges.categories.give(
			['moderate', 'topics:create', 'topics:reply', 'posts:edit', 'posts:delete'],
			testCid,
			[instructorUid]
		);
	});

	describe('Post Creation with isAnonymous flag', () => {
		it('should store isAnonymous=1 when a logged-in user creates a post with isAnonymous', async () => {
			const tid = await topics.create({
				uid: studentUid,
				cid: testCid,
				title: 'Anonymous Topic Test',
			});

			const postData = await posts.create({
				uid: studentUid,
				tid: tid,
				content: 'This is an anonymous post',
				isAnonymous: 1,
			});

			const storedPost = await posts.getPostData(postData.pid);
			assert.strictEqual(storedPost.isAnonymous, 1, 'Post should have isAnonymous=1');
			assert.strictEqual(storedPost.uid, studentUid, 'Post should still store the real uid');
		});

		it('should store isAnonymous=0 (or undefined) when isAnonymous is not set', async () => {
			const tid = await topics.create({
				uid: studentUid,
				cid: testCid,
				title: 'Normal Topic Test',
			});

			const postData = await posts.create({
				uid: studentUid,
				tid: tid,
				content: 'This is a normal post',
			});

			const storedPost = await posts.getPostData(postData.pid);
			assert(
				!storedPost.isAnonymous || storedPost.isAnonymous === 0,
				'Post should not have isAnonymous set'
			);
		});

		it('should not store isAnonymous for guest users (uid=0)', async () => {
			const tid = await topics.create({
				uid: studentUid,
				cid: testCid,
				title: 'Guest Topic Test',
			});

			const postData = await posts.create({
				uid: 0,
				tid: tid,
				content: 'This is a guest post',
				isAnonymous: 1,
			});

			const storedPost = await posts.getPostData(postData.pid);
			assert(
				!storedPost.isAnonymous || storedPost.isAnonymous === 0,
				'Guest posts should not have isAnonymous set (guests are already anonymous)'
			);
		});

		it('should store isAnonymous on topic main post when creating topic anonymously', async () => {
			const result = await topics.post({
				uid: studentUid,
				cid: testCid,
				title: 'Anonymous Main Post Topic',
				content: 'This topic was posted anonymously',
				isAnonymous: 1,
			});

			const storedPost = await posts.getPostData(result.postData.pid);
			assert.strictEqual(storedPost.isAnonymous, 1, 'Main post should have isAnonymous=1');
			assert.strictEqual(storedPost.uid, studentUid, 'Real uid should still be stored');
		});

		it('should store isAnonymous on reply when replying anonymously', async () => {
			const topicResult = await topics.post({
				uid: studentUid,
				cid: testCid,
				title: 'Topic for Anonymous Reply',
				content: 'Regular topic content',
			});

			const replyData = await topics.reply({
				uid: studentUid,
				tid: topicResult.topicData.tid,
				content: 'This reply is anonymous',
				isAnonymous: 1,
			});

			const storedPost = await posts.getPostData(replyData.pid);
			assert.strictEqual(storedPost.isAnonymous, 1, 'Reply should have isAnonymous=1');
		});
	});

	describe('Author masking for non-privileged viewers', () => {
		let anonymousTid;
		let anonymousPid;

		before(async () => {
			const result = await topics.post({
				uid: studentUid,
				cid: testCid,
				title: 'Topic with Anonymous Posts',
				content: 'This is the main post',
			});
			anonymousTid = result.topicData.tid;

			// Create an anonymous reply
			const replyData = await topics.reply({
				uid: studentUid,
				tid: anonymousTid,
				content: 'This is an anonymous reply',
				isAnonymous: 1,
			});
			anonymousPid = replyData.pid;
		});

		it('should mask author info for students viewing anonymous posts', async () => {
			const anotherStudent = await user.create({ username: 'another-student' });

			// Get topic posts as the other student
			const topicData = await topics.getTopicData(anonymousTid);
			const postsData = await topics.getTopicPosts(
				topicData,
				`tid:${anonymousTid}:posts`,
				0, 19, anotherStudent, false
			);

			// Find the anonymous post
			const anonPost = postsData.find(p => p.pid === anonymousPid);
			assert(anonPost, 'Anonymous post should exist in results');
			assert.strictEqual(anonPost.isAnonymous, 1, 'isAnonymous should be set');

			// Build privilege object for the student viewer
			const topicPrivileges = await privileges.topics.get(anonymousTid, anotherStudent);

			// Apply privilege modifications (this is where masking happens)
			const topicDataWithPosts = { ...topicData, posts: postsData, uid: topicData.uid };
			topics.modifyPostsByPrivilege(topicDataWithPosts, topicPrivileges);

			const maskedPost = topicDataWithPosts.posts.find(p => p.pid === anonymousPid);
			assert(maskedPost, 'Masked post should exist');
			assert.strictEqual(maskedPost.user.displayname, 'Anonymous', 'Display name should be "Anonymous" for students');
			assert.strictEqual(maskedPost.user.username, 'Anonymous', 'Username should be "Anonymous" for students');
			assert.strictEqual(maskedPost.user.userslug, '', 'Userslug should be empty for anonymous posts');
			assert.strictEqual(maskedPost.user.uid, 0, 'UID should be masked to 0 for students');
			assert.strictEqual(maskedPost.selfPost, false, 'selfPost should be false for masked posts');
			assert.strictEqual(maskedPost.display_edit_tools, false, 'Edit tools should be hidden for masked posts');
			assert.strictEqual(maskedPost.display_delete_tools, false, 'Delete tools should be hidden for masked posts');
		});

		it('should show real author info to admins for anonymous posts', async () => {
			const topicData = await topics.getTopicData(anonymousTid);
			const postsData = await topics.getTopicPosts(
				topicData,
				`tid:${anonymousTid}:posts`,
				0, 19, adminUid, false
			);

			const anonPost = postsData.find(p => p.pid === anonymousPid);
			assert(anonPost, 'Anonymous post should exist');

			const topicPrivileges = await privileges.topics.get(anonymousTid, adminUid);

			const topicDataWithPosts = { ...topicData, posts: postsData, uid: topicData.uid };
			topics.modifyPostsByPrivilege(topicDataWithPosts, topicPrivileges);

			const revealedPost = topicDataWithPosts.posts.find(p => p.pid === anonymousPid);
			assert(revealedPost, 'Post should exist for admin');
			assert.strictEqual(revealedPost.isAnonymousToInstructor, true, 'Admin should see isAnonymousToInstructor flag');
			assert.strictEqual(revealedPost.user.uid, studentUid, 'Admin should see the real uid');
			assert.notStrictEqual(revealedPost.user.displayname, 'Anonymous', 'Admin should see the real displayname');
		});

		it('should show real author info to moderators for anonymous posts', async () => {
			const topicData = await topics.getTopicData(anonymousTid);
			const postsData = await topics.getTopicPosts(
				topicData,
				`tid:${anonymousTid}:posts`,
				0, 19, instructorUid, false
			);

			const anonPost = postsData.find(p => p.pid === anonymousPid);
			assert(anonPost, 'Anonymous post should exist');

			const topicPrivileges = await privileges.topics.get(anonymousTid, instructorUid);

			const topicDataWithPosts = { ...topicData, posts: postsData, uid: topicData.uid };
			topics.modifyPostsByPrivilege(topicDataWithPosts, topicPrivileges);

			const revealedPost = topicDataWithPosts.posts.find(p => p.pid === anonymousPid);
			assert(revealedPost, 'Post should exist for moderator');
			assert.strictEqual(revealedPost.isAnonymousToInstructor, true, 'Moderator should see isAnonymousToInstructor flag');
			assert.strictEqual(revealedPost.user.uid, studentUid, 'Moderator should see the real uid');
		});
	});

	describe('maskAnonymousPostUser helper', () => {
		it('should properly mask all user fields', () => {
			const post = {
				user: {
					uid: 42,
					username: 'realuser',
					displayname: 'Real User',
					userslug: 'realuser',
					picture: 'http://example.com/pic.jpg',
					status: 'online',
					reputation: 100,
					postcount: 50,
					topiccount: 10,
					signature: 'My signature',
					banned: false,
					selectedGroups: [{ name: 'Group1' }],
					custom_profile_info: [{ content: 'info' }],
				},
				selfPost: true,
				display_edit_tools: true,
				display_delete_tools: true,
				display_moderator_tools: true,
				display_move_tools: true,
			};

			topics.maskAnonymousPostUser(post);

			assert.strictEqual(post.user.uid, 0, 'uid should be masked to 0');
			assert.strictEqual(post.user.username, 'Anonymous', 'username should be Anonymous');
			assert.strictEqual(post.user.displayname, 'Anonymous', 'displayname should be Anonymous');
			assert.strictEqual(post.user.userslug, '', 'userslug should be empty');
			assert.strictEqual(post.user.picture, '', 'picture should be empty');
			assert.strictEqual(post.user.signature, '', 'signature should be empty');
			assert.strictEqual(post.user['icon:text'], '?', 'icon:text should be ?');
			assert.strictEqual(post.user['icon:bgColor'], '#aaa', 'icon:bgColor should be #aaa');
			assert.deepStrictEqual(post.user.selectedGroups, [], 'selectedGroups should be empty');
			assert.deepStrictEqual(post.user.custom_profile_info, [], 'custom_profile_info should be empty');
			assert.strictEqual(post.selfPost, false, 'selfPost should be false');
			assert.strictEqual(post.display_edit_tools, false, 'display_edit_tools should be false');
			assert.strictEqual(post.display_delete_tools, false, 'display_delete_tools should be false');
			assert.strictEqual(post.display_moderator_tools, false, 'display_moderator_tools should be false');
			assert.strictEqual(post.display_move_tools, false, 'display_move_tools should be false');
		});

		it('should handle null/undefined post gracefully', () => {
			assert.doesNotThrow(() => {
				topics.maskAnonymousPostUser(null);
			}, 'Should not throw for null post');

			assert.doesNotThrow(() => {
				topics.maskAnonymousPostUser(undefined);
			}, 'Should not throw for undefined post');

			assert.doesNotThrow(() => {
				topics.maskAnonymousPostUser({});
			}, 'Should not throw for post without user');
		});
	});

	describe('Non-anonymous posts should be unaffected', () => {
		it('should not mask author info for regular (non-anonymous) posts', async () => {
			const result = await topics.post({
				uid: studentUid,
				cid: testCid,
				title: 'Regular Topic',
				content: 'This is a regular post',
			});

			const anotherStudent = await user.create({ username: 'regular-viewer' });
			const topicData = await topics.getTopicData(result.topicData.tid);
			const postsData = await topics.getTopicPosts(
				topicData,
				`tid:${result.topicData.tid}:posts`,
				0, 19, anotherStudent, false
			);

			const topicPrivileges = await privileges.topics.get(result.topicData.tid, anotherStudent);
			const topicDataWithPosts = { ...topicData, posts: postsData, uid: topicData.uid };
			topics.modifyPostsByPrivilege(topicDataWithPosts, topicPrivileges);

			const regularPost = topicDataWithPosts.posts.find(p => p.pid === result.postData.pid);
			assert(regularPost, 'Regular post should exist');
			assert.notStrictEqual(regularPost.user.displayname, 'Anonymous', 'Regular post should show real displayname');
			assert.strictEqual(regularPost.user.uid, studentUid, 'Regular post should show real uid');
		});
	});

	describe('Mixed anonymous and non-anonymous posts in same topic', () => {
		it('should correctly mask only anonymous posts for students', async () => {
			const result = await topics.post({
				uid: studentUid,
				cid: testCid,
				title: 'Mixed Anonymous Topic',
				content: 'Regular main post',
			});

			// Regular reply from instructor
			await topics.reply({
				uid: instructorUid,
				tid: result.topicData.tid,
				content: 'Instructor response (not anonymous)',
			});

			// Anonymous reply from student
			await topics.reply({
				uid: studentUid,
				tid: result.topicData.tid,
				content: 'Anonymous student question',
				isAnonymous: 1,
			});

			const viewer = await user.create({ username: 'mixed-viewer' });
			const topicData = await topics.getTopicData(result.topicData.tid);
			const postsData = await topics.getTopicPosts(
				topicData,
				`tid:${result.topicData.tid}:posts`,
				0, 19, viewer, false
			);

			const topicPrivileges = await privileges.topics.get(result.topicData.tid, viewer);
			const topicDataWithPosts = { ...topicData, posts: postsData, uid: topicData.uid };
			topics.modifyPostsByPrivilege(topicDataWithPosts, topicPrivileges);

			const mainPost = topicDataWithPosts.posts[0];
			const instructorReply = topicDataWithPosts.posts[1];
			const anonReply = topicDataWithPosts.posts[2];

			// Main post should show real author
			assert.strictEqual(mainPost.user.uid, studentUid, 'Main post should show real uid');

			// Instructor reply should show real author
			assert.strictEqual(instructorReply.user.uid, instructorUid, 'Instructor reply should show real uid');

			// Anonymous reply should be masked
			assert.strictEqual(anonReply.user.uid, 0, 'Anonymous reply uid should be masked');
			assert.strictEqual(anonReply.user.displayname, 'Anonymous', 'Anonymous reply should show "Anonymous"');
		});
	});

	describe('Post summary includes isAnonymous field', () => {
		it('should include isAnonymous in post summary data', async () => {
			const result = await topics.post({
				uid: studentUid,
				cid: testCid,
				title: 'Summary Test Topic',
				content: 'Content for summary test',
				isAnonymous: 1,
			});

			const summaries = await posts.getPostSummaryByPids(
				[result.postData.pid],
				studentUid,
				{ stripTags: false }
			);

			assert(summaries.length > 0, 'Should return at least one summary');
			assert.strictEqual(summaries[0].isAnonymous, 1, 'Summary should include isAnonymous field');
		});
	});
});

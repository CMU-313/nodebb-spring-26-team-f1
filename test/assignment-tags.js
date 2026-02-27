'use strict';

const assert = require('assert');
const nconf = require('nconf');
const db = require('./mocks/databasemock');
const User = require('../src/user');
const groups = require('../src/groups');
const categories = require('../src/categories');
const topics = require('../src/topics');
const posts = require('../src/posts');
const helpers = require('./helpers');

describe('Assignment Tags', function () {
	let adminUid;
	let instructorUid;
	let regularUid;
	let categoryId;
	let topicId;
	let postId;
	let adminJar;
	let instructorJar;
	let regularJar;
	let csrfToken;

	// Test data
	let tag1Id;
	let tag2Id;
	let tag3Id;

	before(async function () {
		// Check if PostgreSQL - skip all tests if not
		if (nconf.get('database') !== 'postgres') {
			this.skip();
		}

		// Create test users
		adminUid = await User.create({ username: 'tagadmin', password: 'admin123' });
		instructorUid = await User.create({ username: 'taginstructor', password: 'inst123' });
		regularUid = await User.create({ username: 'tagregular', password: 'regular123' });

		// Assign roles
		await groups.join('administrators', adminUid);

		// Create instructors group if it doesn't exist
		const instructorsExists = await groups.exists('instructors');
		if (!instructorsExists) {
			await groups.create({ name: 'instructors', description: 'Instructors group' });
		}
		await groups.join('instructors', instructorUid);

		// Login users
		const adminLogin = await helpers.loginUser('tagadmin', 'admin123');
		adminJar = adminLogin.jar;
		csrfToken = adminLogin.csrf_token;

		const instructorLogin = await helpers.loginUser('taginstructor', 'inst123');
		instructorJar = instructorLogin.jar;

		const regularLogin = await helpers.loginUser('tagregular', 'regular123');
		regularJar = regularLogin.jar;

		// Create test category
		const category = await categories.create({
			name: 'Assignment Tags Test Category',
			description: 'Category for testing assignment tags',
		});
		categoryId = category.cid;
	});

	describe('Tag CRUD Operations', function () {
		describe('Create Tag', function () {
			it('should allow admin to create a tag', async function () {
				const result = await helpers.request('post', '/api/v3/assignment-tags', {
					jar: adminJar,
					body: {
						name: 'Admin Test Tag',
						color: '#FF0000',
						category: 'Test Category',
					},
				});

				assert.strictEqual(result.response.statusCode, 200);
				assert(result.body.response);
				assert(result.body.response.id);
				assert.strictEqual(result.body.response.name, 'Admin Test Tag');
				assert.strictEqual(result.body.response.color, '#FF0000');
				tag1Id = result.body.response.id;
			});

			it('should allow instructor to create a tag', async function () {
				const result = await helpers.request('post', '/api/v3/assignment-tags', {
					jar: instructorJar,
					body: {
						name: 'Instructor Test Tag',
						color: '#00FF00',
						category: 'Assignments',
					},
				});

				assert.strictEqual(result.response.statusCode, 200);
				assert(result.body.response);
				assert(result.body.response.id);
				tag2Id = result.body.response.id;
			});

			it('should deny regular user from creating a tag', async function () {
				const result = await helpers.request('post', '/api/v3/assignment-tags', {
					jar: regularJar,
					body: {
						name: 'Forbidden Tag',
						color: '#000000',
					},
				});

				assert.strictEqual(result.response.statusCode, 403);
			});

			it('should require authentication to create tag', async function () {
				const result = await helpers.request('post', '/api/v3/assignment-tags', {
					body: {
						name: 'Unauthenticated Tag',
						color: '#000000',
					},
				});

				assert.strictEqual(result.response.statusCode, 401);
			});

			it('should validate required fields', async function () {
				const result = await helpers.request('post', '/api/v3/assignment-tags', {
					jar: instructorJar,
					body: {
						color: '#FF0000',
						// Missing name
					},
				});

				assert.strictEqual(result.response.statusCode, 400);
			});

			it('should use default color if not provided', async function () {
				const result = await helpers.request('post', '/api/v3/assignment-tags', {
					jar: instructorJar,
					body: {
						name: 'Default Color Tag',
					},
				});

				assert.strictEqual(result.response.statusCode, 200);
				assert.strictEqual(result.body.response.color, '#3498db');
				tag3Id = result.body.response.id;
			});
		});

		describe('List Tags', function () {
			it('should allow any authenticated user to list tags', async function () {
				const result = await helpers.request('get', '/api/v3/assignment-tags', {
					jar: regularJar,
				});

				assert.strictEqual(result.response.statusCode, 200);
				assert(Array.isArray(result.body.response));
				assert(result.body.response.length >= 3);

				// Verify tags are properly formatted
				const tag = result.body.response.find(t => t.id === tag1Id);
				assert(tag);
				assert.strictEqual(tag.name, 'Admin Test Tag');
				assert.strictEqual(tag.color, '#FF0000');
			});

			it('should require authentication to list tags', async function () {
				const result = await helpers.request('get', '/api/v3/assignment-tags', {});

				assert.strictEqual(result.response.statusCode, 401);
			});
		});

		describe('Get Single Tag', function () {
			it('should allow authenticated user to get a tag by id', async function () {
				const result = await helpers.request('get', `/api/v3/assignment-tags/${tag1Id}`, {
					jar: regularJar,
				});

				assert.strictEqual(result.response.statusCode, 200);
				assert.strictEqual(result.body.response.id, tag1Id);
				assert.strictEqual(result.body.response.name, 'Admin Test Tag');
			});

			it('should return 404 for non-existent tag', async function () {
				const result = await helpers.request('get', '/api/v3/assignment-tags/99999', {
					jar: regularJar,
				});

				assert.strictEqual(result.response.statusCode, 404);
			});
		});

		describe('Update Tag', function () {
			it('should allow instructor to update a tag', async function () {
				const result = await helpers.request('put', `/api/v3/assignment-tags/${tag2Id}`, {
					jar: instructorJar,
					body: {
						name: 'Updated Instructor Tag',
						color: '#0000FF',
						category: 'Updated Category',
					},
				});

				assert.strictEqual(result.response.statusCode, 200);
				assert.strictEqual(result.body.response.name, 'Updated Instructor Tag');
				assert.strictEqual(result.body.response.color, '#0000FF');
			});

			it('should allow admin to update a tag', async function () {
				const result = await helpers.request('put', `/api/v3/assignment-tags/${tag1Id}`, {
					jar: adminJar,
					body: {
						name: 'Updated Admin Tag',
						color: '#FF00FF',
					},
				});

				assert.strictEqual(result.response.statusCode, 200);
			});

			it('should deny regular user from updating a tag', async function () {
				const result = await helpers.request('put', `/api/v3/assignment-tags/${tag1Id}`, {
					jar: regularJar,
					body: {
						name: 'Hacked Tag',
					},
				});

				assert.strictEqual(result.response.statusCode, 403);
			});

			it('should return 404 for non-existent tag', async function () {
				const result = await helpers.request('put', '/api/v3/assignment-tags/99999', {
					jar: instructorJar,
					body: {
						name: 'Non-existent',
					},
				});

				assert.strictEqual(result.response.statusCode, 404);
			});
		});

		describe('Delete Tag', function () {
			let tempTagId;

			beforeEach(async function () {
				// Create a temporary tag for deletion tests
				const result = await helpers.request('post', '/api/v3/assignment-tags', {
					jar: instructorJar,
					body: {
						name: 'Temp Tag',
						color: '#FFFFFF',
					},
				});
				tempTagId = result.body.response.id;
			});

			it('should allow instructor to delete a tag', async function () {
				const result = await helpers.request('delete', `/api/v3/assignment-tags/${tempTagId}`, {
					jar: instructorJar,
				});

				assert.strictEqual(result.response.statusCode, 200);

				// Verify tag is deleted
				const getResult = await helpers.request('get', `/api/v3/assignment-tags/${tempTagId}`, {
					jar: regularJar,
				});
				assert.strictEqual(getResult.response.statusCode, 404);
			});

			it('should allow admin to delete a tag', async function () {
				const result = await helpers.request('delete', `/api/v3/assignment-tags/${tempTagId}`, {
					jar: adminJar,
				});

				assert.strictEqual(result.response.statusCode, 200);
			});

			it('should deny regular user from deleting a tag', async function () {
				const result = await helpers.request('delete', `/api/v3/assignment-tags/${tempTagId}`, {
					jar: regularJar,
				});

				assert.strictEqual(result.response.statusCode, 403);
			});

			it('should return 404 when deleting non-existent tag', async function () {
				const result = await helpers.request('delete', '/api/v3/assignment-tags/99999', {
					jar: instructorJar,
				});

				assert.strictEqual(result.response.statusCode, 404);
			});
		});
	});

	describe('Tag Assignment on Posts', function () {
		before(async function () {
			// Create a topic for testing
			const topicData = await topics.post({
				uid: regularUid,
				cid: categoryId,
				title: 'Test Topic for Tag Assignment',
				content: 'This is a test topic',
			});
			topicId = topicData.topicData.tid;
			postId = topicData.postData.pid;
		});

		describe('Assign tags to post', function () {
			it('should assign single tag to post', async function () {
				const assignmentTags = require('../src/assignment-tags');
				await assignmentTags.setPostTags(postId, [tag1Id]);

				const tags = await assignmentTags.getPostTags(postId);
				assert.strictEqual(tags.length, 1);
				assert.strictEqual(tags[0].id, tag1Id);
			});

			it('should assign multiple tags to post', async function () {
				const assignmentTags = require('../src/assignment-tags');
				await assignmentTags.setPostTags(postId, [tag1Id, tag2Id, tag3Id]);

				const tags = await assignmentTags.getPostTags(postId);
				assert.strictEqual(tags.length, 3);

				const tagIds = tags.map(t => t.id).sort();
				assert.deepStrictEqual(tagIds, [tag1Id, tag2Id, tag3Id].sort());
			});

			it('should replace existing tags when setting new ones', async function () {
				const assignmentTags = require('../src/assignment-tags');
				await assignmentTags.setPostTags(postId, [tag1Id, tag2Id]);

				let tags = await assignmentTags.getPostTags(postId);
				assert.strictEqual(tags.length, 2);

				// Now replace with only tag3
				await assignmentTags.setPostTags(postId, [tag3Id]);

				tags = await assignmentTags.getPostTags(postId);
				assert.strictEqual(tags.length, 1);
				assert.strictEqual(tags[0].id, tag3Id);
			});

			it('should handle empty tag array', async function () {
				const assignmentTags = require('../src/assignment-tags');
				await assignmentTags.setPostTags(postId, []);

				const tags = await assignmentTags.getPostTags(postId);
				assert.strictEqual(tags.length, 0);
			});

			it('should include tags when fetching post data', async function () {
				const assignmentTags = require('../src/assignment-tags');
				await assignmentTags.setPostTags(postId, [tag1Id, tag2Id]);

				const postData = await posts.getPostData(postId);
				assert(postData.assignmentTags);
				assert.strictEqual(postData.assignmentTags.length, 2);
			});
		});

		describe('Create post with tags', function () {
			it('should create post with tags attached', async function () {
				const topicData = await topics.post({
					uid: regularUid,
					cid: categoryId,
					title: 'Topic with Tags',
					content: 'Content with tags',
					tags: [tag1Id, tag2Id],
				});

				const assignmentTags = require('../src/assignment-tags');
				const tags = await assignmentTags.getPostTags(topicData.postData.pid);
				assert.strictEqual(tags.length, 2);
			});

			it('should create post without tags if none provided', async function () {
				const topicData = await topics.post({
					uid: regularUid,
					cid: categoryId,
					title: 'Topic without Tags',
					content: 'Content without tags',
				});

				const assignmentTags = require('../src/assignment-tags');
				const tags = await assignmentTags.getPostTags(topicData.postData.pid);
				assert.strictEqual(tags.length, 0);
			});
		});
	});

	describe('Tag Filtering', function () {
		let filteredCategoryId;
		let topic1Id;
		let topic2Id;
		let topic3Id;
		let topic4Id;

		before(async function () {
			// Create a fresh category for filtering tests
			const category = await categories.create({
				name: 'Filter Test Category',
				description: 'Category for filter testing',
			});
			filteredCategoryId = category.cid;

			// Create topics with different tag combinations
			const topic1 = await topics.post({
				uid: regularUid,
				cid: filteredCategoryId,
				title: 'Topic with Tag1',
				content: 'Content',
				tags: [tag1Id],
			});
			topic1Id = topic1.topicData.tid;

			const topic2 = await topics.post({
				uid: regularUid,
				cid: filteredCategoryId,
				title: 'Topic with Tag2',
				content: 'Content',
				tags: [tag2Id],
			});
			topic2Id = topic2.topicData.tid;

			const topic3 = await topics.post({
				uid: regularUid,
				cid: filteredCategoryId,
				title: 'Topic with Tag1 and Tag2',
				content: 'Content',
				tags: [tag1Id, tag2Id],
			});
			topic3Id = topic3.topicData.tid;

			const topic4 = await topics.post({
				uid: regularUid,
				cid: filteredCategoryId,
				title: 'Topic with no tags',
				content: 'Content',
			});
			topic4Id = topic4.topicData.tid;
		});

		describe('Filter by single tag', function () {
			it('should filter topics by single tag', async function () {
				const result = await helpers.request('get', `/api/v3/categories/${filteredCategoryId}/topics?assignmentTags=${tag1Id}`, {
					jar: regularJar,
				});

				assert.strictEqual(result.response.statusCode, 200);
				const topicTids = result.body.response.topics.map(t => t.tid);

				// Should include topic1 and topic3 (both have tag1)
				assert(topicTids.includes(topic1Id));
				assert(topicTids.includes(topic3Id));

				// Should not include topic2 and topic4
				assert(!topicTids.includes(topic2Id));
				assert(!topicTids.includes(topic4Id));
			});

			it('should return empty array when no topics match tag', async function () {
				// Create a tag with no posts
				const result = await helpers.request('post', '/api/v3/assignment-tags', {
					jar: instructorJar,
					body: { name: 'Unused Tag', color: '#000000' },
				});
				const unusedTagId = result.body.response.id;

				const filterResult = await helpers.request('get', `/api/v3/categories/${filteredCategoryId}/topics?assignmentTags=${unusedTagId}`, {
					jar: regularJar,
				});

				assert.strictEqual(filterResult.response.statusCode, 200);
				assert.strictEqual(filterResult.body.response.topics.length, 0);
			});
		});

		describe('Filter by multiple tags', function () {
			it('should filter topics by multiple tags (OR operation)', async function () {
				const result = await helpers.request('get', `/api/v3/categories/${filteredCategoryId}/topics?assignmentTags=${tag1Id},${tag2Id}`, {
					jar: regularJar,
				});

				assert.strictEqual(result.response.statusCode, 200);
				const topicTids = result.body.response.topics.map(t => t.tid);

				// Should include topic1, topic2, and topic3 (all have tag1 OR tag2)
				assert(topicTids.includes(topic1Id));
				assert(topicTids.includes(topic2Id));
				assert(topicTids.includes(topic3Id));

				// Should not include topic4 (has no tags)
				assert(!topicTids.includes(topic4Id));
			});

			it('should handle comma-separated tag IDs with spaces', async function () {
				const result = await helpers.request('get', `/api/v3/categories/${filteredCategoryId}/topics?assignmentTags=${tag1Id}, ${tag2Id}`, {
					jar: regularJar,
				});

				assert.strictEqual(result.response.statusCode, 200);
				assert(result.body.response.topics.length >= 3);
			});
		});

		describe('Pagination with filtering', function () {
			it('should support pagination with tag filtering', async function () {
				// Test first page
				const result1 = await helpers.request('get', `/api/v3/categories/${filteredCategoryId}/topics?assignmentTags=${tag1Id}&page=1`, {
					jar: regularJar,
				});

				assert.strictEqual(result1.response.statusCode, 200);
				assert(result1.body.response.topics);

				// All results should have tag1
				const allHaveTag1 = result1.body.response.topics.every(topic =>
					[topic1Id, topic3Id].includes(topic.tid)
				);
				assert(allHaveTag1);
			});
		});

		describe('Edge cases', function () {
			it('should handle invalid tag ID gracefully', async function () {
				const result = await helpers.request('get', `/api/v3/categories/${filteredCategoryId}/topics?assignmentTags=99999`, {
					jar: regularJar,
				});

				assert.strictEqual(result.response.statusCode, 200);
				assert.strictEqual(result.body.response.topics.length, 0);
			});

			it('should handle non-numeric tag ID', async function () {
				const result = await helpers.request('get', `/api/v3/categories/${filteredCategoryId}/topics?assignmentTags=invalid`, {
					jar: regularJar,
				});

				assert.strictEqual(result.response.statusCode, 200);
				// Should filter out invalid IDs and return all topics
			});

			it('should cascade delete post_tags when tag is deleted', async function () {
				// Create a tag and assign it to a post
				const tagResult = await helpers.request('post', '/api/v3/assignment-tags', {
					jar: instructorJar,
					body: { name: 'Delete Test Tag', color: '#123456' },
				});
				const deleteTagId = tagResult.body.response.id;

				const topicData = await topics.post({
					uid: regularUid,
					cid: filteredCategoryId,
					title: 'Topic for delete test',
					content: 'Content',
					tags: [deleteTagId],
				});

				// Verify tag is assigned
				const assignmentTags = require('../src/assignment-tags');
				let tags = await assignmentTags.getPostTags(topicData.postData.pid);
				assert.strictEqual(tags.length, 1);

				// Delete the tag
				await helpers.request('delete', `/api/v3/assignment-tags/${deleteTagId}`, {
					jar: instructorJar,
				});

				// Verify post_tags entry is removed (cascade delete)
				tags = await assignmentTags.getPostTags(topicData.postData.pid);
				assert.strictEqual(tags.length, 0);
			});
		});
	});

	describe('Integration Tests', function () {
		it('should complete full workflow: create tag → assign to post → filter', async function () {
			// 1. Instructor creates a new tag
			const tagResult = await helpers.request('post', '/api/v3/assignment-tags', {
				jar: instructorJar,
				body: {
					name: 'Integration Test Tag',
					color: '#FF69B4',
					category: 'Integration',
				},
			});
			assert.strictEqual(tagResult.response.statusCode, 200);
			const integrationTagId = tagResult.body.response.id;

			// 2. Create category
			const category = await categories.create({
				name: 'Integration Test Category',
				description: 'For integration testing',
			});

			// 3. Regular user creates a topic with the tag
			const topicData = await topics.post({
				uid: regularUid,
				cid: category.cid,
				title: 'Integration Test Topic',
				content: 'Content with tag',
				tags: [integrationTagId],
			});

			// 4. Verify tag is assigned
			const assignmentTags = require('../src/assignment-tags');
			const postTags = await assignmentTags.getPostTags(topicData.postData.pid);
			assert.strictEqual(postTags.length, 1);
			assert.strictEqual(postTags[0].name, 'Integration Test Tag');

			// 5. Filter category by tag
			const filterResult = await helpers.request('get', `/api/v3/categories/${category.cid}/topics?assignmentTags=${integrationTagId}`, {
				jar: regularJar,
			});

			assert.strictEqual(filterResult.response.statusCode, 200);
			assert.strictEqual(filterResult.body.response.topics.length, 1);
			assert.strictEqual(filterResult.body.response.topics[0].tid, topicData.topicData.tid);

			// 6. Instructor updates the tag
			const updateResult = await helpers.request('put', `/api/v3/assignment-tags/${integrationTagId}`, {
				jar: instructorJar,
				body: {
					name: 'Updated Integration Tag',
					color: '#00BFFF',
				},
			});
			assert.strictEqual(updateResult.response.statusCode, 200);

			// 7. Verify updated tag still works for filtering
			const filterResult2 = await helpers.request('get', `/api/v3/categories/${category.cid}/topics?assignmentTags=${integrationTagId}`, {
				jar: regularJar,
			});
			assert.strictEqual(filterResult2.body.response.topics.length, 1);
		});

		it('should handle multiple concurrent tag operations', async function () {
			// Create multiple tags concurrently
			const tagPromises = [];
			for (let i = 0; i < 5; i++) {
				tagPromises.push(
					helpers.request('post', '/api/v3/assignment-tags', {
						jar: instructorJar,
						body: {
							name: `Concurrent Tag ${i}`,
							color: '#' + Math.floor(Math.random() * 16777215).toString(16),
						},
					})
				);
			}

			const results = await Promise.all(tagPromises);
			results.forEach(result => {
				assert.strictEqual(result.response.statusCode, 200);
			});

			// All tags should have unique IDs
			const tagIds = results.map(r => r.body.response.id);
			const uniqueIds = new Set(tagIds);
			assert.strictEqual(uniqueIds.size, 5);
		});
	});

	after(async function () {
		// Cleanup is handled by database mock teardown
	});
});

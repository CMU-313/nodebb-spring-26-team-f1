'use strict';

const router = require('express').Router();
const middleware = require('../../middleware');
const controllers = require('../../controllers');
const routeHelpers = require('../helpers');

const { setupApiRoute } = routeHelpers;

module.exports = function () {
	const middlewares = [middleware.ensureLoggedIn];

	// Tag CRUD operations
	setupApiRoute(router, 'post', '/', [...middlewares], controllers.write.assignmentTags.create);
	setupApiRoute(router, 'get', '/', [...middlewares], controllers.write.assignmentTags.list);
	setupApiRoute(router, 'get', '/:id', [...middlewares], controllers.write.assignmentTags.get);
	setupApiRoute(router, 'put', '/:id', [...middlewares], controllers.write.assignmentTags.update);
	setupApiRoute(router, 'delete', '/:id', [...middlewares], controllers.write.assignmentTags.delete);

	// Get all posts for a tag
	setupApiRoute(router, 'get', '/:id/posts', [...middlewares], controllers.write.assignmentTags.getTagPosts);

	return router;
};

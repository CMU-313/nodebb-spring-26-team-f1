'use strict';

const nconf = require('nconf');

const db = require('../database');
const user = require('../user');
const topics = require('../topics');
const meta = require('../meta');
const helpers = require('./helpers');
const pagination = require('../pagination');
const privileges = require('../privileges');

const readingListController = module.exports;
const relative_path = nconf.get('relative_path');

readingListController.get = async function (req, res, next) {
	const data = await readingListController.getData(req);
	if (!data) {
		return next();
	}

	res.render('reading-list', data);
};

readingListController.getData = async function (req) {
	const page = parseInt(req.query.page, 10) || 1;

	const [settings, rssToken, canPost, isPrivileged] = await Promise.all([
		user.getSettings(req.uid),
		user.auth.getFeedToken(req.uid),
		privileges.categories.canPostTopic(req.uid),
		user.isPrivileged(req.uid),
	]);

	const start = Math.max(0, (page - 1) * settings.topicsPerPage);
	const stop = start + settings.topicsPerPage - 1;

	// Get all topic IDs where isImportant = 1
	const allImportantTids = await db.getSortedSetRevRange('topics:recent', 0, -1);
	const topicsData = await topics.getTopicsData(allImportantTids);
	
	// Filter for important topics
	const importantTids = topicsData
		.filter(topic => topic && topic.isImportant === 1)
		.map(topic => topic.tid);

	// Apply pagination
	const paginatedTids = importantTids.slice(start, stop + 1);
	
	// Get full topic data with privileges
	const topicData = await topics.getTopicsByTids(paginatedTids, req.uid);

	const data = {
		topics: topicData,
		topicCount: importantTids.length,
		nextStart: stop + 1,
	};

	data.title = '[[reading-list:title]]';
	data.breadcrumbs = helpers.buildBreadcrumbs([{ text: '[[reading-list:title]]' }]);

	data.canPost = canPost;
	data.showSelect = isPrivileged;
	data.showTopicTools = isPrivileged;
	data['feeds:disableRSS'] = meta.config['feeds:disableRSS'] || 0;
	data['reputation:disabled'] = meta.config['reputation:disabled'];
	
	if (!meta.config['feeds:disableRSS']) {
		data.rssFeedUrl = `${relative_path}/reading-list.rss`;
		if (req.loggedIn) {
			data.rssFeedUrl += `?uid=${req.uid}&token=${rssToken}`;
		}
	}

	const pageCount = Math.max(1, Math.ceil(importantTids.length / settings.topicsPerPage));
	data.pagination = pagination.create(page, pageCount, req.query);
	helpers.addLinkTags({
		url: 'reading-list',
		res: req.res,
		tags: data.pagination.rel,
		page: page,
	});

	return data;
};

require('../promisify')(readingListController, ['get']);

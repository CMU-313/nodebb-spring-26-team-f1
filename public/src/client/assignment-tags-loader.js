'use strict';

// Auto-load assignment tags on relevant pages
(function () {
	$(document).ready(function () {
		const currentPage = ajaxify.data.template;

		// Pages where assignment tags should be loaded
		const relevantPages = [
			'category',
			'topic',
			'recent',
			'popular',
			'tags',
			'unread',
		];

		if (relevantPages.some(function (page) { return currentPage && currentPage.indexOf(page) === 0; })) {
			require(['forum/assignment-tags'], function (AssignmentTags) {
				AssignmentTags.init();
			});
		}
	});

	// Also load on ajaxify page changes
	$(window).on('action:ajaxify.end', function (ev, data) {
		const template = data.tpl_url;

		if (!template) {
			return;
		}

		const relevantPages = [
			'category',
			'topic',
			'recent',
			'popular',
			'tags',
			'unread',
		];

		if (relevantPages.some(function (page) { return template.indexOf(page) === 0; })) {
			require(['forum/assignment-tags'], function (AssignmentTags) {
				AssignmentTags.init();
			});
		}
	});
})();

'use strict';

// Auto-load assignment tags on relevant pages
(function () {
	var relevantPages = ['category', 'topic', 'recent', 'popular', 'unread', 'compose'];

	function shouldLoad(template) {
		return template && relevantPages.some(function (page) {
			return template.indexOf(page) === 0;
		});
	}

	function load() {
		require(['forum/assignment-tags'], function (AssignmentTags) {
			AssignmentTags.init();
		});
	}

	$(document).ready(function () {
		if (shouldLoad(ajaxify.data.template)) {
			load();
		}
	});

	$(window).on('action:ajaxify.end', function (ev, data) {
		if (shouldLoad(data.tpl_url)) {
			load();
		}
	});
})();

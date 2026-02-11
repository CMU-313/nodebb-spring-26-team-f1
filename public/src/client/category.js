'use strict';

define('forum/category', [], function () {
	var Category = {};

	Category.init = function () {
		initFilterTabs();
	};

	function initFilterTabs() {
		var urlParams = new URLSearchParams(window.location.search);
		var currentAnswered = urlParams.get('answered'); // 'true' | 'false' | null
		updateActiveFilter(currentAnswered);

		$('.filter-tab').off('click.categoryFilter').on('click.categoryFilter', function (e) {
			e.preventDefault();
			var $btn = $(this);
			var resolvedAttr = $btn.attr('data-resolved');
			var filterType;
			if (typeof resolvedAttr !== 'undefined') {
				if (resolvedAttr === '' || resolvedAttr === null) {
					filterType = 'all';
				} else if (resolvedAttr === 'false') {
					filterType = 'unanswered';
				} else if (resolvedAttr === 'true') {
					filterType = 'answered';
				} else {
					filterType = 'all';
				}
			} else {
				filterType = $btn.data('filter') || 'all';
			}
			applyFilter(filterType);
		});
	}

	function applyFilter(filterTypeOrResolved) {
		var answeredValue = '';
		if (filterTypeOrResolved === 'unanswered' || filterTypeOrResolved === 'false') {
			answeredValue = 'false';
		} else if (filterTypeOrResolved === 'answered' || filterTypeOrResolved === 'true') {
			answeredValue = 'true';
		}

		var url = new URL(window.location.href);
		if (answeredValue === '') {
			url.searchParams.delete('answered');
		} else {
			url.searchParams.set('answered', answeredValue);
		}
		updateActiveFilter(answeredValue === '' ? null : answeredValue);
		ajaxify.go(url.pathname + url.search);
	}

	function updateActiveFilter(answeredParam) {
		$('.filter-tab').removeClass('active btn-primary').addClass('btn-outline-secondary');
		var activeFilter = 'all';
		if (answeredParam === 'false') {
			activeFilter = 'unanswered';
		} else if (answeredParam === 'true') {
			activeFilter = 'answered';
		}
		var byFilterSel = '.filter-tab[data-filter="' + activeFilter + '"]';
		var resolvedVal = activeFilter === 'all' ? '' : (activeFilter === 'answered' ? 'true' : 'false');
		var byResolvedSel = '.filter-tab[data-resolved="' + resolvedVal + '"]';
		$(byFilterSel).add(byResolvedSel).addClass('active btn-primary').removeClass('btn-outline-secondary');
	}

	return Category;
});

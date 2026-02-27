'use strict';

define('forum/category', [], function () {
	var Category = {};

	Category.init = function () {
		initFilterTabs();
	};

	function initFilterTabs() {
		var urlParams = new URLSearchParams(window.location.search);
		var currentAnswered = urlParams.get('answered'); // 'true' | 'false' | null
		var currentSort = urlParams.get('sort'); // e.g. 'oldest_created' | null
	
		updateActiveFilter(currentAnswered, currentSort);
	
		$('.filter-tab').off('click.categoryFilter').on('click.categoryFilter', function (e) {
			e.preventDefault();
			var $btn = $(this);
			var resolvedAttr = $btn.attr('data-resolved');
			var sortAttr = $btn.attr('data-sort');
			var filterType;
			if (typeof resolvedAttr !== 'undefined') {
				if (resolvedAttr === '' || resolvedAttr === null) {
					filterType = 'all';
				} else if (resolvedAttr === 'false') {
					filterType = sortAttr === 'oldest_created' ? 'oldest_unanswered' : 'unanswered';
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
		var sortValue = null;
	
		if (filterTypeOrResolved === 'unanswered' || filterTypeOrResolved === 'false') {
			answeredValue = 'false';
		} else if (filterTypeOrResolved === 'answered' || filterTypeOrResolved === 'true') {
			answeredValue = 'true';
		} else if (filterTypeOrResolved === 'oldest_unanswered') {
			answeredValue = 'false';
			sortValue = 'oldest_created';
		}
	
		var url = new URL(window.location.href);
	
		if (answeredValue === '') {
			url.searchParams.delete('answered');
		} else {
			url.searchParams.set('answered', answeredValue);
		}
	
		if (sortValue) {
			url.searchParams.set('sort', sortValue);
		} else {
			// For plain Unanswered/Answered/All, remove explicit sort so defaults apply
			url.searchParams.delete('sort');
		}
	
		updateActiveFilter(
			answeredValue === '' ? null : answeredValue,
			sortValue || url.searchParams.get('sort')
		);
	
		ajaxify.go(url.pathname + url.search);
	}

	function updateActiveFilter(answeredParam, sortParam) {
		$('.filter-tab').removeClass('active btn-primary').addClass('btn-outline-secondary');
	
		var activeFilter = 'all';
		if (answeredParam === 'false') {
			activeFilter = sortParam === 'oldest_created' ? 'oldest_unanswered' : 'unanswered';
		} else if (answeredParam === 'true') {
			activeFilter = 'answered';
		}
	
		var $tabs = $('.filter-tab');
		if (activeFilter === 'oldest_unanswered') {
			$tabs.filter('[data-resolved="false"][data-sort="oldest_created"]')
				.addClass('active btn-primary')
				.removeClass('btn-outline-secondary');
		} else if (activeFilter === 'unanswered') {
			$tabs.filter('[data-resolved="false"]:not([data-sort])')
				.addClass('active btn-primary')
				.removeClass('btn-outline-secondary');
		} else if (activeFilter === 'answered') {
			$tabs.filter('[data-resolved="true"]')
				.addClass('active btn-primary')
				.removeClass('btn-outline-secondary');
		} else {
			$tabs.filter('[data-resolved=""]')
				.addClass('active btn-primary')
				.removeClass('btn-outline-secondary');
		}
	}

	return Category;
});

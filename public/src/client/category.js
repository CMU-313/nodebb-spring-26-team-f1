'use strict';

define('forum/category', [
	'forum/infinitescroll',
	'navigator',
	'topicList',
	'sort',
	'categorySelector',
	'hooks',
	'alerts',
	'api',
	'clipboard',
], function (infinitescroll, navigator, topicList, sort, categorySelector, hooks, alerts, api, clipboard) {
	const Category = {};

	$(window).on('action:ajaxify.start', function (ev, data) {
		if (!String(data.url).startsWith('category/')) {
			navigator.disable();
		}
	});

	Category.init = function () {
		const cid = ajaxify.data.cid;

		app.enterRoom('category_' + cid);

		topicList.init('category', loadTopicsAfter);

		sort.handleSort('categoryTopicSort', 'category/' + ajaxify.data.slug);

		if (!config.usePagination) {
			navigator.init('[component="category/topic"]', ajaxify.data.topic_count, Category.toTop, Category.toBottom);
		} else {
			navigator.disable();
		}

		handleScrollToTopicIndex();

		handleIgnoreWatch(cid);

		handleLoadMoreSubcategories();

		handleDescription();

		categorySelector.init($('[component="category-selector"]'), {
			privilege: 'find',
			parentCid: ajaxify.data.cid,
			onSelect: function (category) {
				ajaxify.go('/category/' + category.cid);
			},
		});

		new clipboard('[data-clipboard-text]');

		hooks.fire('action:topics.loaded', { topics: ajaxify.data.topics });
		hooks.fire('action:category.loaded', { cid: ajaxify.data.cid });

		// resolution filter client wiring: make filter links ajaxify and update active state
		setupResolutionFilter();
	};
	function setupResolutionFilter() {
		// Handle clicks for our resolution filter buttons so navigation is ajaxified
		$(document).on('click', '[component="resolution/filter"] a', function (e) {
			e.preventDefault();
			const href = $(this).attr('href');
			if (href) {
				ajaxify.go(href);
			}
			return false;
		});

		// When topics are loaded, decorate unresolved/older topics
		hooks.register('action:topics.loaded', function () {
			const thresholdMs = 1000 * 60 * 60 * 24 * 2; // 48 hours
			$('[component="category/topic"]').each(function () {
				const $li = $(this);
				const resolvedAttr = $li.attr('data-resolved');
				const resolved = resolvedAttr === 'true' || resolvedAttr === '1' || resolvedAttr === 'yes';
				if (!resolved) {
					// highlight older unanswered topics
					let timeIso = $li.find('.timeago').attr('title') || $li.find('.timeago').data('iso');
					if (!timeIso) {
						// fallback: try the teaser timestamp
						timeIso = $li.find('[component="topic/teaser"] .timeago').attr('title');
					}
					if (timeIso) {
						const ts = Date.parse(timeIso);
						if (ts && (Date.now() - ts) > thresholdMs) {
							$li.addClass('unanswered-old');
						} else {
							$li.removeClass('unanswered-old');
						}
					}
				} else {
					$li.removeClass('unanswered-old');
				}
			});
		});

		// set active state on filter buttons based on query params
		try {
			const params = utils.params();
			const resolvedParam = params.resolved;
			const $links = $('[component="resolution/filter"] a');
			$links.removeClass('active');
			if (resolvedParam === 'true') {
				$links.filter(function () { return $(this).attr('href') && $(this).attr('href').indexOf('resolved=true') !== -1; }).addClass('active');
			} else if (resolvedParam === 'false') {
				$links.filter(function () { return $(this).attr('href') && $(this).attr('href').indexOf('resolved=false') !== -1; }).addClass('active');
			} else {
				$links.first().addClass('active');
			}
		} catch (e) {
			// ignore if utils not available for any reason
		}
	}

	function handleScrollToTopicIndex() {
		let topicIndex = ajaxify.data.topicIndex;
		if (topicIndex && utils.isNumber(topicIndex)) {
			topicIndex = Math.max(0, parseInt(topicIndex, 10));
			if (topicIndex && window.location.search.indexOf('page=') === -1) {
				navigator.scrollToElement($('[component="category/topic"][data-index="' + topicIndex + '"]'), true, 0);
			}
		}
	}

	function handleIgnoreWatch(cid) {
		$('[component="category/watching"], [component="category/tracking"], [component="category/ignoring"], [component="category/notwatching"]').on('click', function () {
			const $this = $(this);
			const state = $this.attr('data-state');

			api.put(`/categories/${encodeURIComponent(cid)}/watch`, { state }, (err) => {
				if (err) {
					return alerts.error(err);
				}

				$('[component="category/watching/menu"]').toggleClass('hidden', state !== 'watching');
				$('[component="category/watching/check"]').toggleClass('fa-check', state === 'watching');

				$('[component="category/tracking/menu"]').toggleClass('hidden', state !== 'tracking');
				$('[component="category/tracking/check"]').toggleClass('fa-check', state === 'tracking');

				$('[component="category/notwatching/menu"]').toggleClass('hidden', state !== 'notwatching');
				$('[component="category/notwatching/check"]').toggleClass('fa-check', state === 'notwatching');

				$('[component="category/ignoring/menu"]').toggleClass('hidden', state !== 'ignoring');
				$('[component="category/ignoring/check"]').toggleClass('fa-check', state === 'ignoring');

				alerts.success('[[category:' + state + '.message]]');
			});
		});
	}

	function handleLoadMoreSubcategories() {
		$('[component="category/load-more-subcategories"]').on('click', async function () {
			const btn = $(this);
			const { categories: data } = await api.get(`/categories/${ajaxify.data.cid}/children?start=${ajaxify.data.nextSubCategoryStart}`);
			btn.toggleClass('hidden', !data.length || data.length < ajaxify.data.subCategoriesPerPage);
			if (!data.length) {
				return;
			}
			app.parseAndTranslate('category', 'children', { children: data }, function (html) {
				html.find('.timeago').timeago();
				$('[component="category/subcategory/container"]').append(html);
				ajaxify.data.nextSubCategoryStart += ajaxify.data.subCategoriesPerPage;
				ajaxify.data.subCategoriesLeft -= data.length;
				btn.toggleClass('hidden', ajaxify.data.subCategoriesLeft <= 0)
					.translateText('[[category:x-more-categories, ' + ajaxify.data.subCategoriesLeft + ']]');
			});

			return false;
		});
	}

	function handleDescription() {
		const fadeEl = document.querySelector('.description.clamp-fade-4');
		if (!fadeEl) {
			return;
		}

		fadeEl.addEventListener('click', () => {
			const state = fadeEl.classList.contains('line-clamp-4');
			fadeEl.classList.toggle('line-clamp-4', !state);
		});
	}

	Category.toTop = function () {
		navigator.scrollTop(0);
	};

	Category.toBottom = async () => {
		const { count } = await api.get(`/categories/${encodeURIComponent(ajaxify.data.category.cid)}/count`);
		navigator.scrollBottom(count - 1);
	};

	function loadTopicsAfter(after, direction, callback) {
		callback = callback || function () {};

		hooks.fire('action:topics.loading');
		const params = utils.params();
		infinitescroll.loadMore(`/categories/${encodeURIComponent(ajaxify.data.cid)}/topics`, {
			after: after,
			direction: direction,
			query: params,
			categoryTopicSort: params.sort || config.categoryTopicSort,
		}, function (data, done) {
			hooks.fire('action:topics.loaded', { topics: data.topics });
			callback(data, done);
		});
	}

	return Category;
});

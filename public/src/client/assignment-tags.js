'use strict';

define('forum/assignment-tags', ['api', 'hooks'], function (api, hooks) {
	const AssignmentTags = {};

	AssignmentTags.init = function () {
		displayTagsOnPosts();
		setupTagClickHandlers();
		setupFilterDropdown();
	};

	function displayTagsOnPosts() {
		// Wait for posts to be loaded
		$(window).on('action:posts.loaded action:topics.loaded', function (ev, data) {
			if (!data || !data.posts) {
				return;
			}

			data.posts.forEach(function (post) {
				if (post.assignmentTags && post.assignmentTags.length > 0) {
					renderTagsOnPost(post.pid, post.assignmentTags);
				}
			});
		});

		// Also handle already loaded posts on page load
		setTimeout(function () {
			$('[component="post"]').each(function () {
				const pid = $(this).attr('data-pid');
				const postData = $(this).data('post');

				if (postData && postData.assignmentTags && postData.assignmentTags.length > 0) {
					renderTagsOnPost(pid, postData.assignmentTags);
				}
			});
		}, 100);
	}

	function renderTagsOnPost(pid, tags) {
		const postElement = $('[component="post"][data-pid="' + pid + '"]');

		// Avoid duplicate rendering
		if (postElement.find('.assignment-tags-display').length > 0) {
			return;
		}

		const tagsHtml = tags.map(function (tag) {
			return `
				<a href="#" class="assignment-tag-chip badge rounded-pill me-1 text-decoration-none"
				   data-tag-id="${tag.id}"
				   style="background-color: ${tag.color}; color: white; cursor: pointer;"
				   title="Filter by ${tag.name}">
					<i class="fa fa-tag"></i> ${tag.name}
				</a>
			`;
		}).join('');

		const tagsContainer = `
			<div class="assignment-tags-display mt-2 mb-2">
				${tagsHtml}
			</div>
		`;

		// Insert tags after post content
		const contentEl = postElement.find('[component="post/content"]');
		if (contentEl.length) {
			contentEl.after(tagsContainer);
		}
	}

	function setupTagClickHandlers() {
		$(document).on('click', '.assignment-tag-chip', function (e) {
			e.preventDefault();
			e.stopPropagation();

			const tagId = $(this).data('tag-id');
			const tagName = $(this).text().trim();

			// Navigate to category with tag filter
			const currentPath = window.location.pathname;
			const categoryMatch = currentPath.match(/^\/category\/(\d+)/);

			if (categoryMatch) {
				const cid = categoryMatch[1];
				// Add tag filter to current category
				window.location.href = `/category/${cid}?assignmentTags=${tagId}`;
			} else {
				// Go to recent topics with tag filter
				window.location.href = `/recent?assignmentTags=${tagId}`;
			}
		});
	}

	function setupFilterDropdown() {
		// Only set up on category and topic list pages
		const isCategoryPage = $('[component="category"]').length > 0;
		const isTopicListPage = $('[component="category/topic"]').length > 0 || $('.topic-list').length > 0;

		if (!isCategoryPage && !isTopicListPage) {
			return;
		}

		// Load available tags
		api.get('/assignment-tags', {}).then(function (tags) {
			if (!tags || tags.length === 0) {
				return;
			}

			renderFilterDropdown(tags);
			applyCurrentFilter();
		}).catch(function (err) {
			console.error('Failed to load assignment tags:', err);
		});
	}

	function renderFilterDropdown(tags) {
		// Find a good place to insert the filter (after category header or topic controls)
		const insertTarget = $('.topic-list-header, [component="category/controls"], .category-tools').first();

		if (!insertTarget.length) {
			return;
		}

		const currentTags = getSelectedTagsFromURL();

		const filterHtml = `
			<div class="assignment-tags-filter mb-3">
				<div class="card">
					<div class="card-body py-2">
						<div class="row align-items-center">
							<div class="col-auto">
								<label class="form-label mb-0 fw-bold">
									<i class="fa fa-filter"></i> Filter by Tags:
								</label>
							</div>
							<div class="col">
								<select id="assignment-tags-filter" class="form-select form-select-sm" multiple>
									${tags.map(function (tag) {
										const selected = currentTags.includes(String(tag.id)) ? 'selected' : '';
										return `<option value="${tag.id}" ${selected} data-color="${tag.color}">
											${tag.name}${tag.category ? ' (' + tag.category + ')' : ''}
										</option>`;
									}).join('')}
								</select>
								<small class="text-muted">Hold Ctrl/Cmd to select multiple</small>
							</div>
							<div class="col-auto">
								<button class="btn btn-primary btn-sm" id="apply-tag-filter">
									<i class="fa fa-check"></i> Apply
								</button>
								<button class="btn btn-secondary btn-sm" id="clear-tag-filter">
									<i class="fa fa-times"></i> Clear
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		insertTarget.after(filterHtml);
		setupFilterHandlers();
	}

	function setupFilterHandlers() {
		$('#apply-tag-filter').on('click', function () {
			const selectedTags = $('#assignment-tags-filter').val() || [];
			applyTagFilter(selectedTags);
		});

		$('#clear-tag-filter').on('click', function () {
			$('#assignment-tags-filter').val([]);
			applyTagFilter([]);
		});

		// Allow Enter key to apply filter
		$('#assignment-tags-filter').on('keypress', function (e) {
			if (e.which === 13) {
				$('#apply-tag-filter').click();
			}
		});
	}

	function applyTagFilter(tagIds) {
		const url = new URL(window.location.href);

		if (tagIds.length > 0) {
			url.searchParams.set('assignmentTags', tagIds.join(','));
		} else {
			url.searchParams.delete('assignmentTags');
		}

		// Reload with new filter
		window.location.href = url.toString();
	}

	function getSelectedTagsFromURL() {
		const urlParams = new URLSearchParams(window.location.search);
		const tagsParam = urlParams.get('assignmentTags') || urlParams.get('tags');

		if (!tagsParam) {
			return [];
		}

		return tagsParam.split(',').map(function (id) { return id.trim(); });
	}

	function applyCurrentFilter() {
		const selectedTags = getSelectedTagsFromURL();

		if (selectedTags.length > 0) {
			// Show active filter indicator
			showActiveFilterBadge(selectedTags);
		}
	}

	function showActiveFilterBadge(tagIds) {
		const badgeHtml = `
			<div class="alert alert-info alert-dismissible fade show" role="alert">
				<i class="fa fa-info-circle"></i>
				<strong>Filtered by ${tagIds.length} tag(s)</strong>
				<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
			</div>
		`;

		$('.assignment-tags-filter').prepend(badgeHtml);
	}

	return AssignmentTags;
});

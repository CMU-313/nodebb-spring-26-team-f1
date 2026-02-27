'use strict';

define('forum/assignment-tags', ['hooks', 'api'], function (hooks, api) {
	const AssignmentTags = {};

	AssignmentTags.init = function () {
		setupTagClickHandlers();
		setupFilterDropdown();
		setupComposerIntegration();
	};

	// Click handler for tag chips — navigates to filtered category view
	function setupTagClickHandlers() {
		$(document).off('click.assignmentTags').on('click.assignmentTags', '.assignment-tag-chip', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var tagId = $(this).attr('data-tag-id');
			if (!tagId) {
				return;
			}
			var cid = ajaxify.data.cid;
			if (cid) {
				ajaxify.go('category/' + cid + '?assignmentTags=' + tagId);
			} else {
				var url = new URL(window.location.href);
				url.searchParams.set('assignmentTags', tagId);
				ajaxify.go(url.pathname.replace(config.relative_path, '').replace(/^\//, '') + '?' + url.searchParams.toString());
			}
		});
	}

	// Filter dropdown on category pages
	function setupFilterDropdown() {
		var $menu = $('#assignment-tags-filter-menu');
		var $btn = $('#assignment-tags-filter-btn');
		var $label = $('#assignment-tags-filter-label');
		var $clear = $('#assignment-tags-clear');

		if (!$menu.length) {
			return;
		}

		// Highlight active filter from URL
		var params = new URLSearchParams(window.location.search);
		var activeTagId = params.get('assignmentTags');
		if (activeTagId) {
			var $activeItem = $menu.find('.assignment-tag-filter-item[data-tag-id="' + activeTagId + '"]');
			if ($activeItem.length) {
				$activeItem.addClass('active');
				$label.text($activeItem.find('span:last').text());
				$btn.removeClass('btn-outline-secondary').addClass('btn-primary');
			}
		}

		// Click a tag item to filter
		$menu.off('click.assignmentTags', '.assignment-tag-filter-item').on('click.assignmentTags', '.assignment-tag-filter-item', function (e) {
			e.preventDefault();
			var tagId = $(this).attr('data-tag-id');
			if (!tagId) {
				return;
			}
			var cid = ajaxify.data.cid;
			if (cid) {
				ajaxify.go('category/' + cid + '?assignmentTags=' + tagId);
			}
		});

		// Clear filter
		$clear.off('click').on('click', function (e) {
			e.preventDefault();
			var cid = ajaxify.data.cid;
			if (cid) {
				ajaxify.go('category/' + cid);
			} else {
				ajaxify.go(window.location.pathname.replace(config.relative_path, '').replace(/^\//, ''));
			}
		});
	}

	// Add tag selector to composer via hook
	function setupComposerIntegration() {
		hooks.on('action:composer.enhance', function (data) {
			var container = data.container;
			if (!container || !container.length) {
				return;
			}
			var tagRow = container.find('.tag-row');
			if (!tagRow.length) {
				return;
			}
			if (container.find('.assignment-tags-selector').length) {
				return;
			}

			api.get('/assignment-tags', {}).then(function (tags) {
				if (!tags || !tags.length) {
					return;
				}
				var options = tags.map(function (tag) {
					return '<option value="' + tag.id + '">' + tag.name + '</option>';
				}).join('');

				var selectorHtml = '<div class="assignment-tags-selector d-flex align-items-center gap-2 mt-1">' +
					'<label class="text-xs text-muted text-nowrap"><i class="fa fa-tag"></i> Assignment Tags:</label>' +
					'<select class="form-select form-select-sm assignment-tags-select" multiple style="max-width: 300px;">' +
					options +
					'</select>' +
					'</div>';
				tagRow.append(selectorHtml);
			}).catch(function () {
				// Silently fail if tags not available
			});
		});
	}

	return AssignmentTags;
});

'use strict';

define('forum/assignment-tags', ['hooks', 'api', 'alerts'], function (hooks, api, alerts) {
	const AssignmentTags = {};
	let allTags = [];

	AssignmentTags.init = function () {
		setupTagClickHandlers();
		setupFilterDropdown();
		setupComposerIntegration();
		setupPostEditTagsUI();
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

	// Add tag selector to composer + hook into submit to send tags
	function setupComposerIntegration() {
		// Add the selector UI when composer opens
		hooks.on('action:composer.enhanced', function (data) {
			var container = data.postContainer;
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
				allTags = tags;
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

		// Intercept submission to add assignment tags to the payload
		hooks.on('filter:composer.submit', function (hookData) {
			var $composer = hookData.composerEl;
			if (!$composer || !$composer.length) {
				return hookData;
			}
			var values = $composer.find('.assignment-tags-select').val() || [];
			if (values.length) {
				hookData.composerData.assignmentTags = values.map(function (id) {
					return parseInt(id, 10);
				});
			}
			return hookData;
		});
	}

	// Add "Edit Tags" to post tools dropdown and handle editing
	function setupPostEditTagsUI() {
		// Inject menu item when post tools dropdown opens
		$(document).off('show.bs.dropdown.assignmentTags').on('show.bs.dropdown.assignmentTags', '[component="post/tools"]', function () {
			var $dropdown = $(this).find('.dropdown-menu');
			if ($dropdown.find('.edit-assignment-tags').length) {
				return;
			}
			$dropdown.prepend(
				'<li><a class="dropdown-item edit-assignment-tags" href="#"><i class="fa fa-fw fa-tag"></i> Edit Assignment Tags</a></li>'
			);
		});

		// Handle click on "Edit Assignment Tags"
		$(document).off('click.editAssignmentTags').on('click.editAssignmentTags', '.edit-assignment-tags', function (e) {
			e.preventDefault();
			var $post = $(this).closest('[component="post"]');
			var pid = $post.attr('data-pid');
			if (!pid) {
				return;
			}
			openEditTagsModal(pid, $post);
		});
	}

	function openEditTagsModal(pid, $postEl) {
		// Fetch all tags and current post tags in parallel
		Promise.all([
			allTags.length ? Promise.resolve(allTags) : api.get('/assignment-tags', {}),
			api.get('/assignment-tags/posts/' + pid, {}),
		]).then(function (results) {
			var tags = results[0] || [];
			var currentTags = results[1] || [];
			allTags = tags;

			if (!tags.length) {
				alerts.alert({ type: 'info', title: 'No Tags', message: 'No assignment tags have been created yet.' });
				return;
			}

			var currentIds = currentTags.map(function (t) { return String(t.id); });
			var options = tags.map(function (tag) {
				var selected = currentIds.indexOf(String(tag.id)) !== -1 ? ' selected' : '';
				return '<option value="' + tag.id + '"' + selected + '>' + tag.name + '</option>';
			}).join('');

			var modalHtml =
				'<div class="modal fade" id="editAssignmentTagsModal" tabindex="-1">' +
				'<div class="modal-dialog modal-sm">' +
				'<div class="modal-content">' +
				'<div class="modal-header">' +
				'<h5 class="modal-title"><i class="fa fa-tag"></i> Edit Assignment Tags</h5>' +
				'<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' +
				'</div>' +
				'<div class="modal-body">' +
				'<select class="form-select edit-tags-select" multiple style="height: 120px;">' +
				options +
				'</select>' +
				'<small class="form-text text-muted">Hold Ctrl/Cmd to select multiple tags</small>' +
				'</div>' +
				'<div class="modal-footer">' +
				'<button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>' +
				'<button type="button" class="btn btn-sm btn-primary save-tags-btn">Save</button>' +
				'</div>' +
				'</div></div></div>';

			// Remove any existing modal
			$('#editAssignmentTagsModal').remove();
			$('body').append(modalHtml);

			var $modal = $('#editAssignmentTagsModal');
			var modal = new bootstrap.Modal($modal[0]);
			modal.show();

			$modal.find('.save-tags-btn').on('click', function () {
				var selected = $modal.find('.edit-tags-select').val() || [];
				var tagIds = selected.map(function (id) { return parseInt(id, 10); });

				api.put('/assignment-tags/posts/' + pid, { tagIds: tagIds }).then(function () {
					modal.hide();
					// Refresh tag chips on the post
					var chipsHtml = '';
					if (tagIds.length) {
						chipsHtml = tagIds.map(function (id) {
							var tag = allTags.find(function (t) { return t.id === id || String(t.id) === String(id); });
							if (!tag) {
								return '';
							}
							return '<a href="#" class="assignment-tag-chip badge rounded-pill text-decoration-none" data-tag-id="' + tag.id + '" style="background-color: ' + tag.color + '; color: #fff;">' +
								'<i class="fa fa-tag"></i> ' + tag.name + '</a>';
						}).join('');
					}

					var $tagsContainer = $postEl.find('[component="post/assignment-tags"]');
					if (chipsHtml) {
						if ($tagsContainer.length) {
							$tagsContainer.html(chipsHtml).show();
						} else {
							$postEl.find('[component="post/content"]').after(
								'<div component="post/assignment-tags" class="d-flex flex-wrap gap-1 mt-2 mb-2">' + chipsHtml + '</div>'
							);
						}
					} else if ($tagsContainer.length) {
						$tagsContainer.hide();
					}

					alerts.success('Assignment tags updated');
				}).catch(function (err) {
					alerts.error(err.message || 'Failed to update tags');
				});
			});

			$modal.on('hidden.bs.modal', function () {
				$modal.remove();
			});
		}).catch(function (err) {
			alerts.error(err.message || 'Failed to load tags');
		});
	}

	return AssignmentTags;
});

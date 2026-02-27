'use strict';

define('modules/assignment-tags', ['api', 'alerts'], function (api, alerts) {
	const AssignmentTags = {};
	let availableTags = [];

	AssignmentTags.init = function () {
		loadTags();
	};

	function loadTags() {
		api.get('/assignment-tags', {}).then((tags) => {
			availableTags = tags;
		}).catch((err) => {
			console.error('Failed to load assignment tags:', err);
		});
	}

	/**
	 * Add assignment tag selector to a container
	 * @param {jQuery} container - The container to add the selector to
	 * @param {Array} selectedTagIds - Currently selected tag IDs
	 */
	AssignmentTags.addSelector = function (container, selectedTagIds) {
		if (!availableTags.length) {
			return;
		}

		selectedTagIds = selectedTagIds || [];

		const html = `
			<div class="form-group assignment-tags-selector mb-3">
				<label class="form-label">
					<i class="fa fa-tags"></i> Assignment Tags
				</label>
				<select class="form-select assignment-tags-select" multiple style="height: 100px;">
					${availableTags.map(tag => `
						<option value="${tag.id}" ${selectedTagIds.includes(tag.id) ? 'selected' : ''}>
							${tag.name}${tag.category ? ` (${tag.category})` : ''}
						</option>
					`).join('')}
				</select>
				<small class="form-text text-muted">
					Hold Ctrl/Cmd to select multiple tags
				</small>
			</div>
		`;

		container.append(html);
	};

	/**
	 * Get selected tag IDs from the selector
	 * @param {jQuery} container - The container with the selector
	 * @returns {Array} - Array of selected tag IDs
	 */
	AssignmentTags.getSelectedTags = function (container) {
		const values = container.find('.assignment-tags-select').val() || [];
		return values.map(id => parseInt(id, 10));
	};

	/**
	 * Display tags on a post
	 * @param {jQuery} postElement - The post element
	 * @param {Array} tags - Array of tag objects
	 */
	AssignmentTags.displayTags = function (postElement, tags) {
		if (!tags || !tags.length) {
			return;
		}

		const tagsHtml = tags.map(tag => `
			<span class="badge rounded-pill me-1" style="background-color: ${tag.color}; color: white;">
				${tag.name}
			</span>
		`).join('');

		const tagsContainer = `
			<div class="post-assignment-tags mt-2">
				<i class="fa fa-tags text-muted"></i> ${tagsHtml}
			</div>
		`;

		postElement.find('.post-content').after(tagsContainer);
	};

	return AssignmentTags;
});

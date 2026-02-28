'use strict';

define('admin/manage/assignment-tags', [
	'api',
	'bootbox',
	'alerts',
], function (api, bootbox, alerts) {
	const AssignmentTags = {};

	AssignmentTags.init = function () {
		handleCreateTag();
		handleEditTag();
		handleDeleteTag();
		handleColorPicker();
	};

	function handleCreateTag() {
		$('#create-tag').on('click', function () {
			$('#tag-modal .modal-title').text('Create Assignment Tag');
			$('#tag-form')[0].reset();
			$('#tag-id').val('');
			$('#tag-color').val('#3498db');
			$('#tag-color-text').val('#3498db');
			$('#tag-modal').modal('show');
		});
	}

	function handleEditTag() {
		$(document).on('click', '.edit-tag', function () {
			const tagId = $(this).data('id');

			// Fetch tag data
			api.get(`/assignment-tags/${tagId}`, {}).then((tag) => {
				$('#tag-modal .modal-title').text('Edit Assignment Tag');
				$('#tag-id').val(tag.id);
				$('#tag-name').val(tag.name);
				$('#tag-color').val(tag.color);
				$('#tag-color-text').val(tag.color);
				$('#tag-category').val(tag.category || '');
				$('#tag-modal').modal('show');
			}).catch((err) => {
				alerts.error(err);
			});
		});
	}

	function handleDeleteTag() {
		$(document).on('click', '.delete-tag', function () {
			const tagId = $(this).data('id');
			const tagName = $(this).closest('tr').find('td:first span').text();

			bootbox.confirm(`Are you sure you want to delete the tag "${tagName}"? This will remove it from all posts.`, function (confirm) {
				if (!confirm) {
					return;
				}

				api.del(`/assignment-tags/${tagId}`, {}).then(() => {
					alerts.success('Tag deleted successfully');
					$(`tr[data-tag-id="${tagId}"]`).fadeOut(function () {
						$(this).remove();
						// Check if table is empty
						if ($('#tags-list tr').length === 0) {
							location.reload();
						}
					});
				}).catch((err) => {
					alerts.error(err);
				});
			});
		});
	}

	function handleColorPicker() {
		// Sync color picker with text input
		$(document).on('input', '#tag-color', function () {
			$('#tag-color-text').val($(this).val());
		});

		$(document).on('input', '#tag-color-text', function () {
			const color = $(this).val();
			if (/^#[0-9A-F]{6}$/i.test(color)) {
				$('#tag-color').val(color);
			}
		});

		// Save tag
		$('#save-tag').on('click', function () {
			const tagId = $('#tag-id').val();
			const data = {
				name: $('#tag-name').val().trim(),
				color: $('#tag-color').val(),
				category: $('#tag-category').val().trim(),
			};

			if (!data.name) {
				return alerts.error('Tag name is required');
			}

			const isEditing = !!tagId;
			const request = isEditing ?
				api.put(`/assignment-tags/${tagId}`, data) :
				api.post('/assignment-tags', data);

			request.then((tag) => {
				alerts.success(isEditing ? 'Tag updated successfully' : 'Tag created successfully');
				$('#tag-modal').modal('hide');

				if (isEditing) {
					// Update the row
					const row = $(`tr[data-tag-id="${tagId}"]`);
					row.find('td:first span').text(tag.name).css('background-color', tag.color);
					row.find('input[type="color"]').val(tag.color);
					row.find('td:nth-child(3)').text(tag.category || '');
				} else {
					// Reload to show new tag
					location.reload();
				}
			}).catch((err) => {
				alerts.error(err);
			});
		});

		// Handle modal hide
		$('#tag-modal').on('hidden.bs.modal', function () {
			$('#tag-form')[0].reset();
		});
	}

	return AssignmentTags;
});

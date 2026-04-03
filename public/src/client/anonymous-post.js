'use strict';

define('forum/anonymous-post', ['hooks'], function (hooks) {
	const AnonymousPost = {};

	AnonymousPost.init = function () {
		hooks.on('action:composer.enhanced', function (data) {
			var container = data.postContainer;
			if (!container || !container.length) {
				return;
			}
			// Don't show for edits
			if (data.postData && data.postData.action === 'posts.edit') {
				return;
			}
			// Only for logged-in users
			if (!app.user.uid) {
				return;
			}
			// Avoid duplicate injection
			if (container.find('.anon-post-checkbox').length) {
				return;
			}

			var checkboxHtml =
				'<div class="anonymous-post-option d-flex align-items-center gap-2 mt-1 mb-1">' +
				'<div class="form-check">' +
				'<input class="form-check-input anon-post-checkbox" type="checkbox" id="anonymousPostCheck">' +
				'<label class="form-check-label text-muted" for="anonymousPostCheck">' +
				'<i class="fa fa-user-secret"></i> Post Anonymously' +
				'</label>' +
				'</div>' +
				'</div>';

			var tagRow = container.find('.tag-row');
			if (tagRow.length) {
				tagRow.after(checkboxHtml);
			} else {
				var writeContainer = container.find('.write-container');
				if (writeContainer.length) {
					writeContainer.before(checkboxHtml);
				} else {
					container.find('.imagedrop').before(checkboxHtml);
				}
			}
		});

		hooks.on('filter:composer.submit', function (hookData) {
			var $composer = hookData.composerEl;
			if (!$composer || !$composer.length) {
				return hookData;
			}
			if ($composer.find('.anon-post-checkbox').is(':checked')) {
				hookData.composerData.isAnonymous = true;
			}
			return hookData;
		});
	};

	return AnonymousPost;
});

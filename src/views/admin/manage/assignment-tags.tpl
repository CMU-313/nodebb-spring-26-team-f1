<div class="assignment-tags d-flex flex-column gap-2 px-lg-4">
	<div class="d-flex border-bottom py-2 m-0 sticky-top acp-page-main-header align-items-center justify-content-between flex-wrap gap-2">
		<div class="">
			<h4 class="fw-bold tracking-tight mb-0">Assignment Tags Management</h4>
		</div>
		<div class="d-flex align-items-center gap-1 flex-wrap">
			<button class="btn btn-primary btn-sm text-nowrap" id="create-tag">
				<i class="fa fa-plus"></i> Create Tag
			</button>
		</div>
	</div>

	{{{ if postgresOnly }}}
	<div class="alert alert-warning">
		<i class="fa fa-exclamation-triangle"></i>
		<strong>PostgreSQL Required:</strong> Assignment tags are only available when using PostgreSQL as the database.
		Your current database is <strong>{config.database}</strong>.
	</div>
	{{{ else }}}

	<div class="assignment-tags-content">
		<div class="alert alert-info text-sm">
			<i class="fa fa-info-circle"></i>
			Assignment tags allow instructors to categorize and organize posts. Create tags with custom names, colors, and categories to help students navigate course content.
		</div>

		{{{ if !tags.length }}}
		<div class="alert alert-light">
			No assignment tags created yet. Click "Create Tag" to add your first tag.
		</div>
		{{{ else }}}
		<div class="table-responsive">
			<table class="table table-striped table-hover">
				<thead>
					<tr>
						<th>Name</th>
						<th>Color</th>
						<th>Category</th>
						<th>Created</th>
						<th class="text-end">Actions</th>
					</tr>
				</thead>
				<tbody id="tags-list">
					{{{ each tags }}}
					<tr data-tag-id="{tags.id}">
						<td>
							<span class="badge rounded-pill" style="background-color: {tags.color}; color: white;">
								{tags.name}
							</span>
						</td>
						<td>
							<input type="color" value="{tags.color}" disabled class="form-control form-control-sm" style="width: 60px; height: 30px;">
						</td>
						<td>{tags.category}</td>
						<td><span class="timeago" title="{tags.created_at}"></span></td>
						<td class="text-end">
							<button class="btn btn-sm btn-light edit-tag" data-id="{tags.id}">
								<i class="fa fa-pencil text-primary"></i> Edit
							</button>
							<button class="btn btn-sm btn-light delete-tag" data-id="{tags.id}">
								<i class="fa fa-trash text-danger"></i> Delete
							</button>
						</td>
					</tr>
					{{{ end }}}
				</tbody>
			</table>
		</div>
		{{{ end }}}
	</div>

	<!-- Create/Edit Tag Modal -->
	<div class="modal fade" id="tag-modal" tabindex="-1">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Create Assignment Tag</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>
				<div class="modal-body">
					<form id="tag-form">
						<input type="hidden" id="tag-id" value="">
						<div class="mb-3">
							<label for="tag-name" class="form-label">
								Tag Name <span class="text-danger">*</span>
							</label>
							<input type="text" class="form-control" id="tag-name" placeholder="e.g., Homework, Exam, Discussion" required>
						</div>
						<div class="mb-3">
							<label for="tag-color" class="form-label">Color</label>
							<div class="d-flex align-items-center gap-2">
								<input type="color" class="form-control form-control-color" id="tag-color" value="#3498db">
								<input type="text" class="form-control" id="tag-color-text" value="#3498db" style="width: 100px;">
							</div>
							<small class="text-muted">Choose a color to visually distinguish this tag</small>
						</div>
						<div class="mb-3">
							<label for="tag-category" class="form-label">Category (Optional)</label>
							<input type="text" class="form-control" id="tag-category" placeholder="e.g., Assignments, Materials, Administrative">
							<small class="text-muted">Group similar tags together</small>
						</div>
					</form>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
					<button type="button" class="btn btn-primary" id="save-tag">Save Tag</button>
				</div>
			</div>
		</div>
	</div>

	{{{ end }}}
</div>

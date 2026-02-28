# Assignment Tags - Developer Guide

## Overview

This guide helps developers understand, extend, and maintain the Assignment Tags feature in NodeBB. It covers the architecture, code organization, testing, and common development tasks.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Development Setup](#development-setup)
4. [Code Walkthrough](#code-walkthrough)
5. [Common Development Tasks](#common-development-tasks)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Extending the Feature](#extending-the-feature)
9. [Performance Considerations](#performance-considerations)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The Assignment Tags feature follows NodeBB's standard 3-layer architecture:

```
┌─────────────────────────────────────────────┐
│  Frontend (Browser)                         │
│  - Client JS modules                        │
│  - Templates (Benchpress)                   │
│  - SCSS styles                              │
└─────────────────┬───────────────────────────┘
                  │ HTTP/WebSocket
┌─────────────────▼───────────────────────────┐
│  Routes Layer                               │
│  - HTTP endpoint definitions                │
│  - Middleware (auth, validation)            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Controller Layer                           │
│  - Request/response handling                │
│  - Response formatting                      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  API Layer                                  │
│  - Permission checks                        │
│  - Business logic orchestration             │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Business Logic Layer                       │
│  - Core tag operations                      │
│  - Direct database access                   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Database (PostgreSQL)                      │
│  - assignment_tags table                    │
│  - post_tags junction table                 │
└─────────────────────────────────────────────┘
```

### Data Flow Examples

**Creating a Tag:**
```
User clicks "Create Tag" → Admin UI (client JS)
  → POST /api/v3/assignment-tags
    → Route Handler (routes/write/assignment-tags.js)
      → Controller (controllers/write/assignment-tags.js)
        → API Layer (api/assignment-tags.js) [Permission Check]
          → Business Logic (src/assignment-tags/index.js)
            → PostgreSQL INSERT
```

**Filtering Topics:**
```
User selects tags → Client JS updates URL
  → GET /api/v3/categories/:cid/topics?assignmentTags=1,2
    → Route Handler
      → Category Controller
        → Categories Logic (categories/topics.js)
          → filterTopicsByAssignmentTags()
            → Assignment Tags Logic
              → PostgreSQL JOIN query
```

---

## File Structure

### Backend Files

```
src/
├── assignment-tags/
│   └── index.js                    # Business logic (CRUD, filtering)
├── api/
│   ├── assignment-tags.js          # API layer with auth
│   └── index.js                    # API module registry
├── controllers/
│   ├── admin/
│   │   └── assignment-tags.js      # Admin page controller
│   ├── write/
│   │   ├── assignment-tags.js      # Write API controllers
│   │   └── index.js                # Controller registry
│   └── admin.js                    # Admin routes
├── routes/
│   ├── write/
│   │   ├── assignment-tags.js      # Route definitions
│   │   └── index.js                # Route registry
│   └── admin.js                    # Admin route definitions
├── posts/
│   ├── create.js                   # Modified: tag assignment on create
│   └── data.js                     # Modified: include tags in post data
├── categories/
│   └── topics.js                   # Modified: tag-based filtering
├── upgrades/
│   └── 1.20.0/
│       └── assignment_tags_schema.js  # Database migration
└── views/
    └── admin/
        └── manage/
            └── assignment-tags.tpl  # Admin page template
```

### Frontend Files

```
public/
├── src/
│   ├── admin/
│   │   └── manage/
│   │       └── assignment-tags.js   # Admin management UI
│   ├── client/
│   │   ├── assignment-tags.js       # Forum display & filtering
│   │   └── assignment-tags-loader.js # Auto-loader
│   └── modules/
│       └── assignment-tags.js       # Reusable tag selector
└── scss/
    └── assignment-tags.scss         # Styles
```

### Documentation Files

```
docs/
├── assignment-tags-api.md           # API reference
├── assignment-tags-database-schema.md  # Database documentation
├── assignment-tags-user-guide.md    # User guide
└── assignment-tags-developer-guide.md  # This file
```

### Test Files

```
test/
└── assignment-tags.js               # Comprehensive test suite
```

---

## Development Setup

### Prerequisites

1. **PostgreSQL 9.5+**
   ```bash
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Node.js 18+**
   ```bash
   node --version  # Should be 18.x or higher
   ```

3. **NodeBB Development Environment**
   ```bash
   git clone https://github.com/NodeBB/NodeBB
   cd NodeBB
   npm install
   ./nodebb setup
   ```

### Configuration

**config.json:**
```json
{
  "url": "http://localhost:4567",
  "database": "postgres",
  "postgres": {
    "host": "127.0.0.1",
    "port": "5432",
    "username": "your_username",
    "password": "your_password",
    "database": "nodebb"
  }
}
```

### Running Migrations

```bash
# Run all migrations including assignment tags
./nodebb upgrade

# Check migration status
psql -U username -d nodebb
\dt  # Should see assignment_tags and post_tags
```

### Starting Development Server

```bash
# Development mode with auto-reload
./nodebb dev

# Production mode
npm start
```

### Creating Instructor Group

```bash
# Via NodeBB CLI
./nodebb create-group --name instructors --description "Course Instructors"

# Or via Admin UI
# Navigate to: http://localhost:4567/admin/manage/groups
```

---

## Code Walkthrough

### Business Logic Layer

**File:** `src/assignment-tags/index.js`

This module handles all database operations for tags. Key functions:

```javascript
// Create a new tag
AssignmentTags.create = async function (data) {
  // Validates name, sets defaults, inserts into DB
  // Returns: { id, name, color, category, created_at, updated_at }
};

// Get all tags
AssignmentTags.getAll = async function () {
  // Returns array of all tags
  // Used for dropdowns, admin lists
};

// Assign tags to a post (replaces existing)
AssignmentTags.setPostTags = async function (postId, tagIds) {
  // Transaction: DELETE old tags, INSERT new tags
  // Validates tag IDs exist
};

// Filter posts by tags (OR operation)
AssignmentTags.filterPostsByTags = async function (postIds, tagIds) {
  // Returns posts that have ANY of the specified tags
  // Used for category filtering
};
```

**Database Access Pattern:**

```javascript
// Direct PostgreSQL queries using db.pool
const result = await db.pool.query(
  'SELECT * FROM assignment_tags WHERE id = $1',
  [tagId]
);
```

**Error Handling:**

```javascript
// Always check for PostgreSQL
if (nconf.get('database') !== 'postgres') {
  throw new Error('[[error:assignment-tags-require-postgres]]');
}

// Validate required fields
if (!data.name || !data.name.trim()) {
  throw new Error('[[error:assignment-tag-name-required]]');
}
```

### API Layer

**File:** `src/api/assignment-tags.js`

Wraps business logic with permission checks:

```javascript
// Permission helper
async function isInstructorOrAdmin(uid) {
  const [isAdmin, isInstructor] = await Promise.all([
    privileges.users.isAdministrator(uid),
    groups.isMember(uid, 'instructors'),
  ]);
  return isAdmin || isInstructor;
}

// Protected endpoint
assignmentTagsAPI.create = async function (caller, data) {
  // Check permissions
  if (!(await isInstructorOrAdmin(caller.uid))) {
    throw new Error('[[error:no-privileges]]');
  }

  // Call business logic
  return await assignmentTags.create(data);
};
```

**Pattern:** API functions receive `caller` object with `uid` for permission checks.

### Controller Layer

**File:** `src/controllers/write/assignment-tags.js`

Handles HTTP requests and responses:

```javascript
AssignmentTags.create = async (req, res) => {
  // Extract data from request body
  const tag = await api.assignmentTags.create(req, req.body);

  // Format response
  helpers.formatApiResponse(200, res, tag);
};
```

**Response Format:**

```javascript
{
  status: { code: "ok", message: "OK" },
  response: { /* actual data */ }
}
```

### Routes Layer

**File:** `src/routes/write/assignment-tags.js`

Defines HTTP endpoints:

```javascript
module.exports = function () {
  const router = require('express').Router();
  const middleware = require('../../middleware');
  const controllers = require('../../controllers');

  const middlewares = [
    middleware.ensureLoggedIn,
    middleware.assert.user,
  ];

  setupApiRoute(router, 'post', '/', [...middlewares],
    controllers.write.assignmentTags.create);

  return router;
};
```

**Route Registration:** Routes are mounted at `/api/v3/assignment-tags` in `src/routes/write/index.js`.

### Integration Points

#### Post Creation Integration

**File:** `src/posts/create.js`

```javascript
// Around line 114
async function addAssignmentTags(pid, tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return;
  }
  const assignmentTags = require('../assignment-tags');
  await assignmentTags.setPostTags(pid, tags);
}

// In the main post creation flow
await Promise.all([
  // ... other operations
  addAssignmentTags(postData.pid, data.tags),
]);
```

#### Post Data Integration

**File:** `src/posts/data.js`

```javascript
// Around line 95
async function addAssignmentTagsToPosts(posts) {
  const assignmentTags = require('../assignment-tags');
  const pids = posts.map(p => p.pid).filter(Boolean);

  // Batch fetch tags for all posts
  const tagResults = await Promise.all(
    pids.map(pid => assignmentTags.getPostTags(pid).catch(() => []))
  );

  // Map tags to posts
  posts.forEach((post, index) => {
    if (post) {
      post.assignmentTags = tagResults[index] || [];
    }
  });
}

// Call in getPostData
if (!fields.length || fields.includes('assignmentTags')) {
  await addAssignmentTagsToPosts(result.posts);
}
```

#### Category Filtering Integration

**File:** `src/categories/topics.js`

```javascript
// Around line 35
async function filterTopicsByAssignmentTags(topicsData, tagIdsParam) {
  // Parse tag IDs (string or array)
  let tagIds = typeof tagIdsParam === 'string' ?
    tagIdsParam.split(',').map(id => parseInt(id.trim(), 10)) :
    tagIdsParam;

  // Get main post IDs for topics
  const mainPids = await Promise.all(
    topicsData.map(topic => topics.getTopicField(topic.tid, 'mainPid'))
  );

  // Filter posts by tags
  const assignmentTags = require('../assignment-tags');
  const filteredPids = await assignmentTags.filterPostsByTags(mainPids, tagIds);
  const filteredPidSet = new Set(filteredPids.map(String));

  // Return only topics whose main post matches
  return topicsData.filter((topic, index) =>
    filteredPidSet.has(String(mainPids[index]))
  );
}

// Call in getCategoryTopics
if (data.assignmentTags) {
  topicsData = await filterTopicsByAssignmentTags(topicsData, data.assignmentTags);
}
```

### Frontend Code

#### Admin Management UI

**File:** `public/src/admin/manage/assignment-tags.js`

```javascript
define('admin/manage/assignment-tags', ['api', 'bootbox', 'alerts'], function (api, bootbox, alerts) {
  // Create tag handler
  $('#create-tag').on('click', function () {
    $('#tag-modal').modal('show');
  });

  // Save tag handler
  $('#save-tag').on('click', function () {
    const data = {
      name: $('#tag-name').val().trim(),
      color: $('#tag-color').val(),
      category: $('#tag-category').val().trim(),
    };

    const request = isEditing ?
      api.put(`/assignment-tags/${tagId}`, data) :
      api.post('/assignment-tags', data);

    request.then((tag) => {
      alerts.success('Tag saved successfully');
      $('#tag-modal').modal('hide');
      // Update UI
    });
  });
});
```

**Key Patterns:**
- Uses RequireJS/AMD module pattern
- API calls via `api` module (handles CSRF automatically)
- Bootstrap modals for forms
- Real-time UI updates without page reload

#### Forum Display & Filtering

**File:** `public/src/client/assignment-tags.js`

```javascript
define('forum/assignment-tags', ['api'], function (api) {
  const AssignmentTags = {};

  AssignmentTags.init = function () {
    displayTagsOnPosts();
    setupTagClickHandlers();
    setupFilterDropdown();
  };

  function displayTagsOnPosts() {
    // Find all posts with assignmentTags data
    $('[component="post"]').each(function () {
      const pid = $(this).attr('data-pid');
      const tags = $(this).data('assignment-tags');
      if (tags && tags.length) {
        renderTagsOnPost(pid, tags);
      }
    });
  }

  return AssignmentTags;
});
```

**Auto-loader:** `public/src/client/assignment-tags-loader.js` automatically initializes on relevant pages.

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Add business logic function** (`src/assignment-tags/index.js`)
2. **Add API wrapper with permissions** (`src/api/assignment-tags.js`)
3. **Add controller handler** (`src/controllers/write/assignment-tags.js`)
4. **Add route definition** (`src/routes/write/assignment-tags.js`)
5. **Add tests** (`test/assignment-tags.js`)

**Example: Add endpoint to search tags by name**

```javascript
// 1. Business logic (src/assignment-tags/index.js)
AssignmentTags.search = async function (query) {
  const result = await db.pool.query(
    'SELECT * FROM assignment_tags WHERE name ILIKE $1',
    [`%${query}%`]
  );
  return result.rows;
};

// 2. API layer (src/api/assignment-tags.js)
assignmentTagsAPI.search = async function (caller, data) {
  if (!caller.uid) {
    throw new Error('[[error:not-logged-in]]');
  }
  return await assignmentTags.search(data.query);
};

// 3. Controller (src/controllers/write/assignment-tags.js)
AssignmentTags.search = async (req, res) => {
  const results = await api.assignmentTags.search(req, req.query);
  helpers.formatApiResponse(200, res, results);
};

// 4. Route (src/routes/write/assignment-tags.js)
setupApiRoute(router, 'get', '/search', [...middlewares],
  controllers.write.assignmentTags.search);
```

### Adding a New Tag Property

1. **Update database schema** (create new migration in `src/upgrades/`)
2. **Update business logic** to handle new property
3. **Update API validation**
4. **Update admin form template**
5. **Update admin JS to save/load new property**
6. **Update tests**

**Example: Add tag description field**

```sql
-- Migration: src/upgrades/1.20.1/add_tag_description.js
ALTER TABLE assignment_tags ADD COLUMN description TEXT;
```

```javascript
// Business logic update
AssignmentTags.create = async function (data) {
  // Add description to insert
  const result = await db.pool.query(
    'INSERT INTO assignment_tags (name, color, category, description) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.name, data.color, data.category, data.description]
  );
  return result.rows[0];
};
```

### Modifying Tag Filtering Logic

**Current:** OR operation (posts with ANY selected tag)

**To change to AND:** Modify `filterPostsByTags` in `src/assignment-tags/index.js`:

```javascript
// Current (OR logic):
const result = await db.pool.query(`
  SELECT DISTINCT post_id FROM post_tags WHERE tag_id = ANY($1)
`, [tagIds]);

// Change to AND logic:
const result = await db.pool.query(`
  SELECT post_id FROM post_tags
  WHERE tag_id = ANY($1)
  GROUP BY post_id
  HAVING COUNT(DISTINCT tag_id) = $2
`, [tagIds, tagIds.length]);
```

### Adding Frontend Tag Features

**Example: Add tag autocomplete**

1. **Create endpoint** to search tags (see above)
2. **Add autocomplete library** (e.g., typeahead.js)
3. **Update composer** to use autocomplete instead of dropdown
4. **Update styles**

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run only assignment tags tests
./node_modules/.bin/mocha test/assignment-tags.js

# Run with coverage
npm run coverage

# Watch mode for development
./node_modules/.bin/mocha test/assignment-tags.js --watch
```

### Test Structure

Tests are organized by feature:

1. **Tag CRUD Operations** - Create, read, update, delete with auth
2. **Tag Assignment** - Assigning tags to posts
3. **Tag Filtering** - Single tag, multiple tags, pagination
4. **Integration Tests** - Full workflow tests
5. **Edge Cases** - Error handling, cascade deletes

### Writing New Tests

```javascript
describe('New Feature', function () {
  let tagId, postId;

  before(async function () {
    // Setup: create test data
    const tag = await helpers.request('post', '/api/v3/assignment-tags', {
      jar: instructorJar,
      body: { name: 'Test Tag', color: '#FF0000' }
    });
    tagId = tag.body.response.id;
  });

  it('should do something', async function () {
    // Test code
    const result = await helpers.request('get', `/api/v3/assignment-tags/${tagId}`, {
      jar: regularJar
    });

    assert.strictEqual(result.response.statusCode, 200);
    assert.strictEqual(result.body.response.name, 'Test Tag');
  });

  after(async function () {
    // Cleanup if needed
  });
});
```

### Testing Best Practices

- **Use descriptive test names** that explain what's being tested
- **Test both success and failure cases**
- **Mock external dependencies** when appropriate
- **Use before/after hooks** for setup/teardown
- **Test edge cases** (empty arrays, invalid IDs, etc.)
- **Keep tests independent** - each test should work in isolation

---

## Debugging

### Enabling Debug Logging

```javascript
// In business logic
const winston = require('winston');
winston.verbose('[assignment-tags] Creating tag:', data);

// In API layer
console.log('[DEBUG] Permission check for uid:', caller.uid);
```

### Common Issues

**Issue: "PostgreSQL required" error**
```javascript
// Check database config
console.log('Database:', require('nconf').get('database'));

// Should output: "postgres"
```

**Issue: Tags not appearing on posts**
```javascript
// Check if tags are actually saved
const AssignmentTags = require('./src/assignment-tags');
const tags = await AssignmentTags.getPostTags(postId);
console.log('Tags for post', postId, ':', tags);
```

**Issue: Filtering not working**
```javascript
// Debug filtering logic
const filtered = await AssignmentTags.filterPostsByTags([1, 2, 3], [5]);
console.log('Filtered posts:', filtered);
```

### Database Debugging

```sql
-- Check if tables exist
\dt

-- View tag data
SELECT * FROM assignment_tags;

-- View post-tag relationships
SELECT pt.*, at.name
FROM post_tags pt
JOIN assignment_tags at ON at.id = pt.tag_id
LIMIT 10;

-- Find posts without tags
SELECT p.pid
FROM posts p
LEFT JOIN post_tags pt ON pt.post_id = p.pid
WHERE pt.tag_id IS NULL;

-- Check for orphaned relationships
SELECT pt.*
FROM post_tags pt
LEFT JOIN posts p ON p.pid = pt.post_id
LEFT JOIN assignment_tags at ON at.id = pt.tag_id
WHERE p.pid IS NULL OR at.id IS NULL;
```

---

## Extending the Feature

### Adding Tag Permissions

**Current:** All instructors can manage all tags

**To Add:** Per-tag ownership

1. Add `creator_uid` to `assignment_tags` table
2. Update `create()` to save creator UID
3. Update API permission checks:

```javascript
assignmentTagsAPI.update = async function (caller, data) {
  const tag = await assignmentTags.get(data.id);

  // Check if user created this tag or is admin
  const isAdmin = await privileges.users.isAdministrator(caller.uid);
  const isCreator = tag.creator_uid === caller.uid;

  if (!isAdmin && !isCreator) {
    throw new Error('[[error:no-privileges]]');
  }

  return await assignmentTags.update(data.id, data);
};
```

### Adding Tag Analytics

Track tag usage statistics:

```javascript
// Add to business logic
AssignmentTags.getUsageStats = async function () {
  const result = await db.pool.query(`
    SELECT
      at.id,
      at.name,
      COUNT(pt.post_id) as post_count,
      COUNT(DISTINCT p.uid) as unique_users,
      MAX(p.timestamp) as last_used
    FROM assignment_tags at
    LEFT JOIN post_tags pt ON pt.tag_id = at.id
    LEFT JOIN posts p ON p.pid = pt.post_id
    GROUP BY at.id, at.name
    ORDER BY post_count DESC
  `);
  return result.rows;
};
```

Create admin dashboard to display stats.

### Adding Tag Subscriptions

Allow users to subscribe to tags for notifications:

1. Create `tag_subscriptions` table
2. Add subscribe/unsubscribe API endpoints
3. Hook into post creation to notify subscribers
4. Add UI for managing subscriptions

---

## Performance Considerations

### Indexing

Ensure these indexes exist:

```sql
-- Critical for filtering performance
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);

-- Composite index for lookups
CREATE INDEX idx_post_tags_composite ON post_tags(post_id, tag_id);
```

### Batch Operations

When fetching tags for multiple posts, use batch queries:

```javascript
// Bad: N queries
for (const post of posts) {
  post.tags = await AssignmentTags.getPostTags(post.pid);
}

// Good: Single batch query
const pids = posts.map(p => p.pid);
const allTags = await AssignmentTags.getPostTagsBatch(pids);
posts.forEach(post => {
  post.tags = allTags[post.pid] || [];
});
```

### Caching

Consider caching frequently accessed data:

```javascript
const cache = require('../cache');

AssignmentTags.getAll = async function () {
  const cached = cache.get('assignment-tags:all');
  if (cached) return cached;

  const tags = await db.pool.query('SELECT * FROM assignment_tags');
  cache.set('assignment-tags:all', tags.rows, 300); // 5 min TTL
  return tags.rows;
};

// Invalidate cache on updates
AssignmentTags.create = async function (data) {
  const result = await db.pool.query(/* ... */);
  cache.del('assignment-tags:all');
  return result.rows[0];
};
```

### Query Optimization

Use EXPLAIN ANALYZE to optimize slow queries:

```sql
EXPLAIN ANALYZE
SELECT DISTINCT post_id
FROM post_tags
WHERE tag_id = ANY(ARRAY[1,2,3]);
```

---

## Troubleshooting

### Migration Issues

**Problem:** Migration doesn't run

**Solution:**
1. Check `src/meta/data.js` for version number
2. Verify migration file is in correct directory
3. Run `./nodebb upgrade --skip` to skip specific migrations
4. Manually run SQL if needed

### Permission Errors

**Problem:** Instructor can't create tags

**Solution:**
1. Verify instructor group exists: `./nodebb groups:list`
2. Check user is in group: Check `group:instructors:members` in Redis/Mongo
3. Verify permission check in API layer

### Frontend Not Loading

**Problem:** Tags don't appear in UI

**Solution:**
1. Check browser console for JS errors
2. Verify RequireJS module is loading: Check Network tab
3. Check template includes tag data: `{{{ if post.assignmentTags }}}`
4. Verify auto-loader is registering events

---

## Best Practices

### Code Style

- Follow NodeBB's existing patterns
- Use async/await, not callbacks
- Handle errors explicitly
- Add JSDoc comments for public functions

### Security

- Always validate user input
- Use parameterized queries (prevent SQL injection)
- Check permissions before mutations
- Escape HTML output in templates

### Testing

- Write tests before fixing bugs
- Maintain >80% code coverage
- Test edge cases and error conditions
- Use descriptive test names

### Documentation

- Update API docs when adding endpoints
- Document breaking changes
- Keep inline comments up to date
- Update user guide for UI changes

---

## Contributing

### Submitting Changes

1. Create feature branch: `git checkout -b feature/tag-improvements`
2. Make changes with clear commits
3. Add/update tests
4. Update documentation
5. Submit pull request with description

### Code Review Checklist

- [ ] Tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Documentation updated
- [ ] Backward compatible (or migration provided)
- [ ] No security vulnerabilities
- [ ] Performance considered
- [ ] Accessibility maintained

---

## Additional Resources

- **NodeBB Documentation:** https://docs.nodebb.org/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **API Reference:** `/docs/assignment-tags-api.md`
- **Database Schema:** `/docs/assignment-tags-database-schema.md`
- **User Guide:** `/docs/assignment-tags-user-guide.md`

---

**Happy Developing! 🚀**

*Version 1.0 | Last updated: February 2024*

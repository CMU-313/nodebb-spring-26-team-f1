# Assignment Tags API Documentation

## Overview

The Assignment Tags API allows instructors and administrators to create, manage, and assign tags to posts for better organization and categorization of course content. Regular users can view tags and filter content by tags.

**Base URL:** `/api/v3/assignment-tags`

**Database Requirement:** PostgreSQL only. This feature is not available with MongoDB or Redis databases.

## Authentication & Authorization

All endpoints require authentication. Authorization levels:

- **Read operations** (GET): All authenticated users
- **Write operations** (POST, PUT, DELETE): Instructors and Administrators only

## Endpoints

### Tag Management

#### Create Tag

Creates a new assignment tag.

**Endpoint:** `POST /api/v3/assignment-tags`

**Authorization:** Instructor or Administrator only

**Request Body:**

```json
{
  "name": "Homework",
  "color": "#FF5733",
  "category": "Assignments"
}
```

**Request Schema:**

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| name | string | Yes | Tag name (max 255 chars) | - |
| color | string | No | Hex color code (e.g., #FF5733) | #3498db |
| category | string | No | Category for grouping tags | empty string |

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": {
    "id": 1,
    "name": "Homework",
    "color": "#FF5733",
    "category": "Assignments",
    "created_at": "2024-02-27T10:30:00.000Z",
    "updated_at": "2024-02-27T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing or invalid required fields
  ```json
  {
    "status": {
      "code": "bad-request",
      "message": "Tag name is required"
    }
  }
  ```

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User is not an instructor or administrator
  ```json
  {
    "status": {
      "code": "not-authorised",
      "message": "Only instructors and administrators can create tags"
    }
  }
  ```

---

#### List All Tags

Retrieves all assignment tags.

**Endpoint:** `GET /api/v3/assignment-tags`

**Authorization:** Any authenticated user

**Query Parameters:** None

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": [
    {
      "id": 1,
      "name": "Homework",
      "color": "#FF5733",
      "category": "Assignments",
      "created_at": "2024-02-27T10:30:00.000Z",
      "updated_at": "2024-02-27T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Exam",
      "color": "#3498db",
      "category": "Assessments",
      "created_at": "2024-02-27T11:00:00.000Z",
      "updated_at": "2024-02-27T11:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `503 Service Unavailable` - PostgreSQL not configured
  ```json
  {
    "status": {
      "code": "internal-server-error",
      "message": "Assignment tags require PostgreSQL database"
    }
  }
  ```

---

#### Get Single Tag

Retrieves a specific tag by ID.

**Endpoint:** `GET /api/v3/assignment-tags/:id`

**Authorization:** Any authenticated user

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Tag ID |

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": {
    "id": 1,
    "name": "Homework",
    "color": "#FF5733",
    "category": "Assignments",
    "created_at": "2024-02-27T10:30:00.000Z",
    "updated_at": "2024-02-27T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Tag does not exist
  ```json
  {
    "status": {
      "code": "not-found",
      "message": "Tag not found"
    }
  }
  ```

---

#### Update Tag

Updates an existing tag.

**Endpoint:** `PUT /api/v3/assignment-tags/:id`

**Authorization:** Instructor or Administrator only

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Tag ID |

**Request Body:**

```json
{
  "name": "Updated Homework",
  "color": "#00FF00",
  "category": "Updated Assignments"
}
```

**Request Schema:**

All fields are optional. Only provided fields will be updated.

| Field | Type | Description |
|-------|------|-------------|
| name | string | New tag name |
| color | string | New hex color code |
| category | string | New category |

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": {
    "id": 1,
    "name": "Updated Homework",
    "color": "#00FF00",
    "category": "Updated Assignments",
    "created_at": "2024-02-27T10:30:00.000Z",
    "updated_at": "2024-02-27T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User is not an instructor or administrator
- `404 Not Found` - Tag does not exist

---

#### Delete Tag

Deletes a tag and removes it from all posts (cascade delete).

**Endpoint:** `DELETE /api/v3/assignment-tags/:id`

**Authorization:** Instructor or Administrator only

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Tag ID |

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": {
    "id": 1
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User is not an instructor or administrator
- `404 Not Found` - Tag does not exist

**Note:** This operation cascades to the `post_tags` junction table, automatically removing all tag assignments.

---

### Post-Tag Relationships

#### Get Posts for Tag

Retrieves all posts that have a specific tag.

**Endpoint:** `GET /api/v3/assignment-tags/:id/posts`

**Authorization:** Any authenticated user

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Tag ID |

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": {
    "posts": [1, 5, 12, 23]
  }
}
```

**Response Schema:**

| Field | Type | Description |
|-------|------|-------------|
| posts | integer[] | Array of post IDs (pids) |

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Tag does not exist

---

#### Get Tags for Post

Retrieves all tags assigned to a specific post.

**Endpoint:** `GET /api/v3/posts/:pid/assignment-tags`

**Authorization:** Any authenticated user

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| pid | integer | Post ID |

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": [
    {
      "id": 1,
      "name": "Homework",
      "color": "#FF5733",
      "category": "Assignments"
    },
    {
      "id": 3,
      "name": "Discussion",
      "color": "#3498db",
      "category": "Participation"
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Post does not exist

---

#### Set Tags for Post

Sets (replaces) all tags for a specific post.

**Endpoint:** `PUT /api/v3/posts/:pid/assignment-tags`

**Authorization:** Any authenticated user (must own the post or have privileges)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| pid | integer | Post ID |

**Request Body:**

```json
{
  "tags": [1, 2, 3]
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tags | integer[] | Yes | Array of tag IDs to assign |

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": {
    "pid": 123,
    "tags": [1, 2, 3]
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid tag IDs or malformed request
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User doesn't have permission to edit this post
- `404 Not Found` - Post does not exist

**Note:** This operation replaces all existing tags. To remove all tags, send an empty array: `{"tags": []}`.

---

#### Add Tag to Post

Adds a single tag to a post without affecting existing tags.

**Endpoint:** `POST /api/v3/posts/:pid/assignment-tags/:tagId`

**Authorization:** Any authenticated user (must own the post or have privileges)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| pid | integer | Post ID |
| tagId | integer | Tag ID |

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": {
    "pid": 123,
    "tagId": 1
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User doesn't have permission to edit this post
- `404 Not Found` - Post or tag does not exist

---

#### Remove Tag from Post

Removes a specific tag from a post.

**Endpoint:** `DELETE /api/v3/posts/:pid/assignment-tags/:tagId`

**Authorization:** Any authenticated user (must own the post or have privileges)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| pid | integer | Post ID |
| tagId | integer | Tag ID |

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": {
    "pid": 123,
    "tagId": 1
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User doesn't have permission to edit this post
- `404 Not Found` - Post or tag does not exist

---

### Topic Filtering

#### Filter Topics by Tags

Filter topics in a category by assignment tags.

**Endpoint:** `GET /api/v3/categories/:cid/topics`

**Authorization:** Any authenticated user

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| cid | integer | Category ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assignmentTags | string | No | Comma-separated tag IDs (e.g., "1,2,3") |
| page | integer | No | Page number for pagination (default: 1) |
| sort | string | No | Sort order (e.g., "recent", "popular") |

**Examples:**

- Single tag: `/api/v3/categories/1/topics?assignmentTags=5`
- Multiple tags: `/api/v3/categories/1/topics?assignmentTags=1,2,3`
- With pagination: `/api/v3/categories/1/topics?assignmentTags=1,2&page=2`

**Response:** `200 OK`

```json
{
  "status": {
    "code": "ok",
    "message": "OK"
  },
  "response": {
    "topics": [
      {
        "tid": 123,
        "title": "Topic with tags",
        "slug": "123/topic-with-tags",
        "timestamp": 1709035800000,
        "mainPid": 456,
        "assignmentTags": [
          {
            "id": 1,
            "name": "Homework",
            "color": "#FF5733"
          }
        ]
      }
    ],
    "nextStart": 20,
    "pageCount": 3
  }
}
```

**Filtering Logic:**

- Multiple tags use OR operation (topics with ANY of the specified tags)
- Only topics whose main post has at least one of the specified tags are included
- Invalid tag IDs are ignored

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Category does not exist

---

## Creating Posts with Tags

When creating a new topic/post, you can include tags in the request:

**Endpoint:** `POST /api/v3/topics`

**Request Body:**

```json
{
  "cid": 1,
  "title": "My Homework Question",
  "content": "Need help with problem set 3",
  "tags": [1, 2]
}
```

The `tags` field accepts an array of tag IDs that will be assigned to the main post of the topic.

---

## Data Models

### Tag Object

```typescript
interface AssignmentTag {
  id: number;
  name: string;
  color: string;        // Hex color code (e.g., "#FF5733")
  category?: string;    // Optional category for grouping
  created_at: string;   // ISO 8601 timestamp
  updated_at: string;   // ISO 8601 timestamp
}
```

### Post with Tags

When fetching post data, tags are included in the response:

```typescript
interface Post {
  pid: number;
  content: string;
  // ... other post fields
  assignmentTags?: AssignmentTag[];  // Array of tags assigned to this post
}
```

---

## Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | bad-request | Invalid request data or missing required fields |
| 401 | not-authorized | User is not authenticated |
| 403 | not-authorised | User lacks permission for this operation |
| 404 | not-found | Requested resource does not exist |
| 500 | internal-server-error | Server error or PostgreSQL not available |
| 503 | service-unavailable | Database not configured correctly |

---

## Rate Limiting

API requests are subject to NodeBB's standard rate limiting:

- Read operations: 300 requests per minute
- Write operations: 60 requests per minute

Exceeding these limits will result in `429 Too Many Requests` responses.

---

## Examples

### Example 1: Create and Assign Tags

```javascript
// 1. Create a tag (instructor only)
const createResponse = await fetch('/api/v3/assignment-tags', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Homework 1',
    color: '#FF5733',
    category: 'Assignments'
  })
});
const tag = await createResponse.json();
const tagId = tag.response.id;

// 2. Create a topic with the tag
const topicResponse = await fetch('/api/v3/topics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cid: 1,
    title: 'Homework 1 Question',
    content: 'I need help with question 3',
    tags: [tagId]
  })
});
```

### Example 2: Filter Topics by Tags

```javascript
// Get all topics in category 1 that have tag ID 5 or 7
const response = await fetch('/api/v3/categories/1/topics?assignmentTags=5,7');
const data = await response.json();
const filteredTopics = data.response.topics;
```

### Example 3: Update Post Tags

```javascript
// Replace all tags on post 123 with tags 1 and 2
await fetch('/api/v3/posts/123/assignment-tags', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tags: [1, 2]
  })
});

// Add tag 3 to the post
await fetch('/api/v3/posts/123/assignment-tags/3', {
  method: 'POST'
});

// Remove tag 1 from the post
await fetch('/api/v3/posts/123/assignment-tags/1', {
  method: 'DELETE'
});
```

---

## Notes

- **PostgreSQL Only:** This feature requires PostgreSQL. Using MongoDB or Redis will result in error responses.
- **Cascade Deletes:** Deleting a tag automatically removes all post-tag associations.
- **OR Filtering:** When filtering by multiple tags, topics that match ANY tag are included (OR operation, not AND).
- **Permissions:** Tag management is restricted to instructors and administrators. The `instructors` group must be created before non-admin users can manage tags.
- **Color Format:** Colors must be valid hex codes with # prefix (e.g., #FF5733). Invalid formats may be accepted but could cause display issues.
- **Tag Persistence:** Tags are stored in the database and persist across server restarts.
- **Frontend Integration:** Tags automatically appear on posts when using the standard NodeBB templates.

---

## Changelog

### Version 1.0.0 (2024-02-27)
- Initial release
- Tag CRUD operations
- Post-tag relationships
- Topic filtering by tags
- Admin management interface
- Frontend display and filtering

# User Guide

## Table of Contents

1. [Anonymous Posting Feature](#user-guide-anonymous-posting-feature)
2. [Assignment Tags Feature](#user-guide-assignment-tags-feature)

---

# User Guide: Anonymous Posting Feature

## Overview

The Anonymous Posting feature allows students to post questions and replies anonymously. Their identity is hidden from other students but remains visible to instructors.

## How It Works

### For Students

#### Posting Anonymously

1. **Open the Composer** - Click "New Topic" or "Reply" on any topic.
2. **Toggle Anonymous Mode** - In the composer toolbar area (next to the submit button), there will be an **"Anonymous"** toggle switch. Enable it by clicking the switch.
3. **Write and Submit** - Write the post content as usual and click **Submit**.

When the anonymous toggle is enabled:
- The post will appear as authored by **"Anonymous"** to all other students.
- User avatar will be replaced with a generic anonymous icon.
- Other students cannot see the user's profile link, signature, or group badges.
- The user will not have edit/delete controls on anonymous posts (to prevent accidental identity reveal through edit history).

#### Viewing Anonymous Posts

- Posts marked as anonymous display the author as **"Anonymous"** with a grey badge labeled "Anonymous" next to the username area.
- You cannot click on the anonymous author's name to view their profile.
- Anonymous posts can still be upvoted, downvoted, replied to, and quoted like any other post.

### For Instructors (Admins & Moderators)

Instructors can always see the real identity of anonymous posters:

- **Real Author Visible** - The actual username and avatar of the anonymous poster is displayed.
- **Anonymous Indicator** - A yellow/orange badge labeled **"Anonymous post"** with an eye icon appears next to the author's name, indicating that the post was made anonymously.
- **Moderation Tools** - Full edit, delete, and moderation tools remain available for anonymous posts.

## Feature Details

### What Gets Anonymized

When a student posts anonymously, the following are hidden from other students:
- Username and display name (replaced with "Anonymous")
- Profile picture/avatar (replaced with a generic icon)
- Profile link (disabled)
- User signature
- Group badges
- Reputation, post count, and other user statistics

### What Is Not Anonymized

- The post content itself is always visible to everyone
- The timestamp of the post is visible
- Votes on the post are visible
- The post can still be replied to and quoted

### Anonymous Posts in Topics

- A topic can contain a mix of anonymous and non-anonymous posts
- The main topic post can also be created anonymously
- Each post's anonymity is independent - you can reply anonymously to one post and non-anonymously to another in the same topic

## User Testing Instructions

### Test Scenario 1: Student Posts Anonymously

1. Log in as a regular student account
2. Navigate to any category and click "New Topic"
3. Enable the "Anonymous" toggle in the composer
4. Enter a title and content, then submit
5. **Expected**: The topic is created successfully
6. Log out and view the topic as a different student or guest
7. **Expected**: The author shows as "Anonymous" with a grey badge

### Test Scenario 2: Instructor Views Anonymous Post

1. Using the topic created in Scenario 1, log in as an admin or moderator
2. Navigate to the topic
3. **Expected**: The real student's name is visible, with a yellow "Anonymous post" badge indicator

### Test Scenario 3: Anonymous Reply

1. Log in as a student
2. Navigate to an existing topic and click "Reply"
3. Enable the "Anonymous" toggle
4. Write a reply and submit
5. **Expected**: The reply appears with the author as "Anonymous" to other students

### Test Scenario 4: Mixed Posts in Same Topic

1. Create a topic with a normal (non-anonymous) post
2. Reply anonymously as a different student
3. Reply non-anonymously as an instructor
4. View the topic as a regular student
5. **Expected**: Only the anonymous reply shows "Anonymous"; all other posts show real authors

### Test Scenario 5: Non-Logged-In Users

1. Create an anonymous post
2. View the topic without logging in (as a guest, if guest access is enabled)
3. **Expected**: The anonymous post shows "Anonymous" to guest viewers

## Automated Tests

### Location

Automated tests for this feature are located at:

**`test/anonymous-posting.js`**

### Running the Tests

```bash
npx mocha test/anonymous-posting.js --timeout 30000 --exit
```

### What Is Tested

The test suite covers the following scenarios:

1. **Post Creation with isAnonymous flag**
   - Storing `isAnonymous=1` when a logged-in user creates an anonymous post
   - Verifying the real `uid` is still stored alongside the anonymous flag
   - Ensuring `isAnonymous` is not set for regular posts
   - Ensuring guest users (uid=0) don't get `isAnonymous` set (they are inherently anonymous)
   - Anonymous flag on topic main posts
   - Anonymous flag on replies

2. **Author Masking for Non-Privileged Viewers**
   - Students viewing anonymous posts see "Anonymous" as displayname
   - Students see uid=0, empty userslug, and no profile picture
   - Edit/delete tools are hidden from students for anonymous posts
   - Admins can see the real author of anonymous posts
   - Admins see the `isAnonymousToInstructor` indicator flag
   - Moderators can see the real author of anonymous posts

3. **maskAnonymousPostUser Helper**
   - All user fields are properly masked (username, displayname, picture, signature, etc.)
   - Post action flags are properly disabled (selfPost, edit tools, delete tools)
   - Graceful handling of null/undefined inputs

4. **Non-Anonymous Posts Unaffected**
   - Regular posts continue to show real author info to all users

5. **Mixed Anonymous and Non-Anonymous Posts**
   - In a topic with both types, only anonymous posts are masked for students
   - Instructor replies remain visible, student anonymous replies are masked

6. **Post Summary**
   - The `isAnonymous` field is included in post summary data

### Why These Tests Are Sufficient

- **Database layer**: Tests verify that the `isAnonymous` flag is correctly stored and retrieved
- **Authorization boundary**: Tests verify the core security requirement that students cannot see anonymous authors while instructors can
- **Edge cases**: Tests cover guest users, null inputs, and mixed post types
- **Integration**: Tests use the actual `topics.post()`, `topics.reply()`, and `topics.modifyPostsByPrivilege()` functions, exercising the full backend flow

## Technical Implementation Summary

### Files Modified

| File | Change |
|------|--------|
| `src/posts/data.js` | Added `isAnonymous` to `intFields` for proper integer parsing |
| `src/posts/create.js` | Store `isAnonymous` flag when creating posts |
| `src/posts/summary.js` | Include `isAnonymous` in post summary field retrieval |
| `src/topics/posts.js` | Author masking logic in `modifyPostsByPrivilege()` and new `maskAnonymousPostUser()` helper |
| `src/controllers/composer.js` | Pass `isAnonymous` from request body |
| `public/src/client/topic/posts.js` | Client-side masking for real-time posts via WebSocket |
| `node_modules/nodebb-plugin-composer-default/static/lib/composer.js` | Anonymous toggle data and submission |
| `node_modules/nodebb-plugin-composer-default/static/templates/partials/composer-title-container.tpl` | Anonymous toggle UI element |
| `vendor/nodebb-theme-harmony-main/templates/partials/topic/post.tpl` | Anonymous and instructor badge indicators |

### Files Added

| File | Purpose |
|------|---------|
| `test/anonymous-posting.js` | Automated test suite for the anonymous posting feature |

---

# User Guide: Assignment Tags Feature

## Overview

The Assignment Tags feature allows instructors to create colored labels (tags) that can be attached to posts. This helps organize forum content by assignment, topic area, or any other category the instructor defines. Students can filter topics by tags to quickly find posts related to a specific assignment.

## How It Works

### For Instructors (Admins)

#### Creating Tags

1. **Navigate to Admin Panel** - Go to **Admin > Manage > Assignment Tags**.
2. **Click "Create Tag"** - A modal dialog will appear.
3. **Fill in Tag Details**:
   - **Name** (required) - A short label for the tag (e.g., "HW1", "Midterm", "Project 2").
   - **Color** - Choose a color using the color picker. This color will be used as the tag's background.
   - **Category** - An optional grouping label (e.g., "Homework", "Exams").
4. **Click "Save"** - The tag is created and immediately available for use.

#### Managing Tags

From the **Admin > Manage > Assignment Tags** page:

- **Edit a Tag** - Click the edit button on any tag to change its name, color, or category.
- **Delete a Tag** - Click the delete button to permanently remove a tag. This also removes it from all posts it was applied to.
- Tags are displayed in a list showing their name, color swatch, and category.

#### Tagging Posts

Instructors can assign tags to posts in two ways:

1. **During Post Creation** - When composing a new topic or reply, use the tag selector in the composer to choose one or more assignment tags before submitting.
2. **On Existing Posts** - Click the tag icon on any post to open a tag editor modal. Select or deselect tags, then save.

### For Students

#### Viewing Tags on Posts

- Posts with assignment tags display colored tag badges below the post content.
- Each badge shows the tag name with its assigned color.
- Tags are visible on all posts in topic view.

#### Filtering Topics by Tag

1. **Navigate to a Category** - Go to any forum category page.
2. **Use the Tag Filter** - A dropdown filter appears at the top of the topic list. Click it to see all available assignment tags.
3. **Select Tags** - Click one or more tags to filter. The topic list will update to show only topics whose main post has any of the selected tags.
4. **Clear Filter** - Deselect all tags or click the clear/reset option to show all topics again.

Filtering uses OR logic: if you select "HW1" and "HW2", topics tagged with either tag will appear.

## Feature Details

### Tag Properties

Each assignment tag has the following properties:

| Property | Description |
|----------|-------------|
| **Name** | The display label (e.g., "Homework 1") |
| **Color** | A hex color code used for the tag badge background |
| **Category** | An optional grouping label for organizing tags |

### Permissions

- **Creating, editing, and deleting tags** - Restricted to admins and members of the "instructors" group.
- **Assigning tags to posts** - Restricted to admins and instructors.
- **Viewing tags** - All logged-in users can see tags on posts.
- **Filtering by tags** - All logged-in users can filter topics by tags.

### Tags and Posts

- A post can have multiple tags assigned to it.
- Tags are applied to individual posts, not entire topics. However, filtering on the category page checks the main (first) post of each topic.
- When a tag is deleted, it is automatically removed from all posts.
- Tags can be reassigned at any time by an instructor.

## User Testing Instructions

### Test Scenario 1: Admin Creates a Tag

1. Log in as an admin account
2. Navigate to **Admin > Manage > Assignment Tags**
3. Click **"Create Tag"**
4. Enter name "Homework 1", pick a blue color, enter category "Homework"
5. Click **Save**
6. **Expected**: The tag appears in the tag list with its name, color, and category

### Test Scenario 2: Admin Edits a Tag

1. On the Assignment Tags admin page, click the edit button on "Homework 1"
2. Change the name to "HW1" and change the color to green
3. Click **Save**
4. **Expected**: The tag list updates to show the new name and color

### Test Scenario 3: Admin Deletes a Tag

1. On the Assignment Tags admin page, click the delete button on a tag
2. Confirm the deletion
3. **Expected**: The tag is removed from the list and from any posts it was applied to

### Test Scenario 4: Instructor Tags a Post

1. Log in as an instructor
2. Navigate to an existing topic
3. Click the tag icon on a post to open the tag editor
4. Select one or more tags, then save
5. **Expected**: The selected tags appear as colored badges on the post

### Test Scenario 5: Tagging During Post Creation

1. Log in as an instructor
2. Click "New Topic" or "Reply"
3. In the composer, use the tag selector to choose assignment tags
4. Write content and submit
5. **Expected**: The new post displays the selected tags

### Test Scenario 6: Student Views Tags

1. Log in as a regular student
2. Navigate to a topic that has tagged posts
3. **Expected**: Tags are visible as colored badges on the posts
4. **Expected**: The student cannot add, edit, or remove tags (no tag editor available)

### Test Scenario 7: Filtering Topics by Tag

1. Log in as any user
2. Navigate to a category that has topics with different tags
3. Open the tag filter dropdown at the top of the topic list
4. Select a tag (e.g., "HW1")
5. **Expected**: Only topics whose main post has the "HW1" tag are shown
6. Select an additional tag (e.g., "HW2")
7. **Expected**: Topics with either "HW1" or "HW2" are shown (OR logic)
8. Clear the filter
9. **Expected**: All topics are shown again

### Test Scenario 8: Multiple Tags on a Single Post

1. As an instructor, assign three different tags to one post
2. View the post as a student
3. **Expected**: All three tags are displayed as badges on the post

## Automated Tests

### Location

Automated tests for this feature are located at:

**`test/assignment-tags.js`**

### Running the Tests

```bash
npx mocha test/assignment-tags.js --timeout 30000 --exit
```

### What Is Tested

The test suite covers the following scenarios:

1. **Tag CRUD Operations**
   - Creating a tag with name, color, and category
   - Listing all tags
   - Getting a single tag by ID
   - Updating a tag's properties
   - Deleting a tag

2. **Tag Assignment to Posts**
   - Adding a tag to a post
   - Removing a tag from a post
   - Setting multiple tags on a post (replace all)
   - Getting all tags for a post

3. **Tag-Based Filtering**
   - Filtering topics by a single tag
   - Filtering topics by multiple tags (OR logic)
   - Filtering returns correct results with mixed tagged/untagged topics

4. **Permission Checks**
   - Non-instructor users cannot create, edit, or delete tags
   - Non-instructor users cannot assign tags to posts
   - All logged-in users can view tags

5. **Edge Cases**
   - Creating a tag without a name returns an error
   - Deleting a tag removes it from all associated posts
   - Assigning a non-existent tag returns an error

### Why These Tests Are Sufficient

- **CRUD coverage**: All create, read, update, and delete operations are tested
- **Authorization boundary**: Tests verify that only instructors/admins can manage tags
- **Integration**: Tests exercise the full stack from HTTP request through database
- **Filtering logic**: Tests confirm that tag-based topic filtering works correctly
- **Data integrity**: Tests verify cascade behavior when tags are deleted

## Technical Implementation Summary

### Files Added

| File | Purpose |
|------|---------|
| `src/assignment-tags/index.js` | Business logic for tag CRUD, post-tag assignment, and filtering |
| `src/api/assignment-tags.js` | API layer with permission checks |
| `src/controllers/write/assignment-tags.js` | Write API controller for HTTP requests |
| `src/controllers/admin/assignment-tags.js` | Admin page controller |
| `src/routes/write/assignment-tags.js` | Route definitions for the assignment-tags API |
| `public/src/admin/manage/assignment-tags.js` | Admin management UI (create, edit, delete tags) |
| `public/src/client/assignment-tags.js` | Forum-side tag display, filtering, and edit modal |
| `public/src/client/assignment-tags-loader.js` | Auto-loader for initializing tag display on pages |
| `public/src/modules/assignment-tags.js` | Reusable tag selector module for the composer |
| `src/views/admin/manage/assignment-tags.tpl` | Admin page template |
| `test/assignment-tags.js` | Automated test suite |
| `docs/assignment-tags-developer-guide.md` | Developer documentation |
| `docs/assignment-tags-api.md` | API reference documentation |
| `docs/assignment-tags-database-schema.md` | Database schema documentation |

### Files Modified

| File | Change |
|------|--------|
| `src/posts/create.js` | Assign tags to posts during creation |
| `src/posts/data.js` | Include `assignmentTags` in post data retrieval (bulk fetch) |
| `src/categories/topics.js` | Filter topics by assignment tags when `assignmentTags` query param is present |
| `src/api/index.js` | Register the `assignmentTags` API module |
| `src/controllers/write/index.js` | Register the `assignmentTags` controller |
| `src/routes/write/index.js` | Mount assignment-tags routes at `/api/v3/assignment-tags` |
| `src/routes/admin.js` | Add admin route for the assignment tags management page |

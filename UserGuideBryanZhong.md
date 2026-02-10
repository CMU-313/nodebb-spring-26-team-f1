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
| `UserGuide.md` | This user documentation file |

# User Guide: Important Pin Feature

## Overview

The Important Pin feature allows instructors and moderators to mark topics as "important" for classwide announcements. These topics are displayed prominently on the forum and collected in a dedicated "Reading List" page for easy access. This feature is designed for course policy changes, due dates, and other critical information that students need to see.

## Key Differences from Regular Pinning

- **Scope**: Important topics are **global** across all categories, while pinned topics are category-specific
- **Hierarchy**: Topics are sorted as: Pinned > Important > Regular
- **Purpose**: Important pins are for classwide announcements (policy changes, due dates), while regular pins are for category-specific sticky posts
- **Reading List**: Important topics appear in a dedicated `/reading-list` page for easy reference

## User Roles and Permissions

- **Instructors/Administrators**: Can mark/unmark any topic as important
- **Moderators**: Can mark/unmark topics as important in categories they moderate
- **Students/Regular Users**: Can view important topics but cannot mark them

## How to Use

### Marking a Topic as Important

1. Navigate to any topic you want to mark as important
2. Click the "Tools" button (gear icon) in the topic header
3. Select "Mark as Important" from the dropdown menu
4. The topic will now display an "Important" badge with a bullhorn icon
5. The topic will appear at the top of all global feeds (Recent, Popular, etc.) below pinned topics

### Unmarking a Topic as Important

1. Navigate to the important topic
2. Click the "Tools" button (gear icon) in the topic header
3. Select "Unmark as Important" from the dropdown menu
4. The important badge will be removed
5. The topic will return to normal sorting priority

### Viewing All Important Topics

1. Navigate to `/reading-list` in your browser (e.g., `http://localhost:4567/reading-list`)
2. This page displays **all important topics globally** across every category
3. Topics are sorted by most recent first
4. Use this as a quick reference for all classwide announcements

### Visual Indicators

- **Important Badge**: Topics marked as important display a badge with a bullhorn icon (🔊) next to the topic title
- **Badge Location**: Appears between the pinned badge and locked badge in the topic header
- **Menu Items**: The Tools menu shows either "Mark as Important" or "Unmark as Important" depending on current state

## User Testing Instructions

### Test 1: Basic Mark/Unmark Functionality

1. **Setup**: Log in as an instructor or administrator
2. **Action**: Create a new topic in any category
3. **Test**: 
   - Open the topic
   - Click Tools → "Mark as Important"
   - Verify the "Important" badge appears
   - Navigate to the home page
   - Verify the topic appears near the top (below pinned topics if any exist)
   - Return to the topic
   - Click Tools → "Unmark as Important"
   - Verify the badge disappears
4. **Expected Result**: Badge appears/disappears correctly, topic sorting updates

### Test 2: Reading List Page

1. **Setup**: Mark 2-3 topics as important from different categories
2. **Action**: Navigate to `/reading-list`
3. **Test**:
   - Verify all important topics appear on the page
   - Verify regular (non-important) topics do not appear
   - Unmark one topic as important
   - Refresh the reading list page
   - Verify the unmarked topic no longer appears
4. **Expected Result**: Reading list accurately reflects current important topics

### Test 3: Sorting Priority

1. **Setup**: Create three topics in the same category:
   - Topic A: Regular (no flags)
   - Topic B: Important
   - Topic C: Pinned
2. **Action**: Navigate to the home page or Recent page
3. **Test**: Observe the order of topics
4. **Expected Result**: Topics should appear in order: Topic C (pinned), Topic B (important), Topic A (regular)

### Test 4: Permission Checking

1. **Setup**: Log in as a regular user (non-admin, non-moderator)
2. **Action**: Navigate to any topic
3. **Test**: Open the Tools menu
4. **Expected Result**: "Mark as Important" option should NOT appear in the menu

### Test 5: Combined Pinned + Important

1. **Setup**: Create a topic
2. **Action**: 
   - Pin the topic (Tools → Pin Topic)
   - Mark it as important (Tools → Mark as Important)
3. **Test**: 
   - Verify both badges appear
   - Navigate to home page
   - Verify topic appears at the top with both indicators
4. **Expected Result**: Topic can have both flags simultaneously

## Automated Test Coverage

### Location of Tests

All automated tests can be found in the test suite:
- **test/topics.js** (lines 656-679, 881-940): Core functionality tests
- **test/controllers.js** (lines 1954-2026): Reading list controller tests

### What is Being Tested

#### 1. API Functionality Tests (test/topics.js, lines 656-679)

**Test: "should mark topic as important"**
- Verifies that `apiTopics.markImportant()` correctly sets the `isImportant` field to 1
- Validates database state after marking

**Test: "should unmark topic as important"**
- Verifies that `apiTopics.unmarkImportant()` correctly sets the `isImportant` field to 0
- Validates database state after unmarking

**Test: "should allow only admins/mods to mark topics as important"**
- Attempts to mark a topic as important with a regular user (non-admin/non-moderator)
- Verifies that a privilege error is thrown
- Ensures authorization is properly enforced

#### 2. Sorting Logic Tests (test/topics.js, lines 881-940)

**Test: "should sort topics with pinned > important > regular priority"**
- Creates four topics: regular, important, pinned, and important+pinned
- Calls `topics.getSortedTopics()` with `floatPinned: true`
- Verifies the sorting order matches the expected hierarchy
- Ensures pinned topics appear before important topics
- Ensures important topics appear before regular topics

**Test: "should mark topic as important"**
- Verifies that the `isImportant` field is correctly set to 1 in the database

**Test: "should mark pinned topic as important"**
- Tests that a topic can have both `pinned` and `isImportant` flags simultaneously
- Verifies database state for combined flags

#### 3. Reading List Controller Tests (test/controllers.js, lines 1954-2026)

**Test: "should display reading list page"**
- Tests that the `/reading-list` route returns HTTP 200
- Verifies the response contains a topics array
- Validates basic page structure

**Test: "should only show important topics in reading list"**
- Creates two important topics and one regular topic
- Fetches the reading list
- Verifies important topics are present
- Verifies regular topic is excluded
- Ensures filtering logic works correctly

**Test: "should update reading list when topic is unmarked as important"**
- Marks two topics as important
- Unmarks one topic
- Refetches the reading list
- Verifies the unmarked topic is removed
- Verifies the other important topic remains
- Tests dynamic updates to the reading list

### Why These Tests Are Sufficient

#### Comprehensive Coverage

1. **Database Layer**: Tests verify that `isImportant` field is correctly read/written in the database
2. **API Layer**: Tests cover both the marking and unmarking API endpoints
3. **Authorization Layer**: Tests ensure privilege checking works correctly
4. **Business Logic**: Tests validate the three-tier sorting algorithm (pinned > important > regular)
5. **Controller Layer**: Tests verify the reading list page correctly fetches and filters important topics
6. **State Management**: Tests ensure topics can transition between states (regular ↔ important)

#### Edge Cases Covered

- Topics with both pinned and important flags
- Unauthorized access attempts
- Dynamic updates when importance changes
- Global cross-category important topic retrieval
- Empty reading list states

#### Acceptance Criteria Alignment

These tests directly map to the acceptance criteria from the initial planning:

✅ **Instructors can mark topics as important**: Tested via API tests and permission tests  
✅ **Important topics appear at top of feeds**: Tested via sorting logic tests  
✅ **Reading list shows all important topics**: Tested via controller integration tests  
✅ **Only admins/mods can mark important**: Tested via permission tests  
✅ **Topics can be unmarked**: Tested via API tests and reading list update tests  

#### Integration Testing

The tests exercise the full stack:
- Database operations (reading/writing isImportant field)
- Business logic (sorting algorithm in sorted.js)
- API layer (markImportant/unmarkImportant endpoints)
- Authorization (privilege checking)
- Controller layer (reading list page rendering)
- HTTP layer (route responses)

### Running the Tests

To run the automated tests:

```bash
# Run all tests
npm test

# Run only topic tests
npm test -- test/topics.js

# Run only controller tests
npm test -- test/controllers.js

# Run with verbose output
npm test -- --verbose
```

Expected output should show all tests passing with green checkmarks. If any test fails, review the error message and verify the implementation matches the test expectations.

## Technical Implementation Notes

### Database Schema
- New field: `isImportant` (integer, 0 or 1) added to topic objects
- Initialized to 0 for all new topics

### API Endpoints
- `PUT /api/v3/topics/:tid/important` - Mark topic as important
- `DELETE /api/v3/topics/:tid/important` - Unmark topic as important

### Socket Events
- `event:topic_important` - Emitted when topic is marked as important
- `event:topic_unimportant` - Emitted when topic is unmarked as important

### Routes
- `/reading-list` - Dedicated page for viewing all important topics globally

## Troubleshooting

### Issue: "Mark as Important" doesn't appear in Tools menu
**Solution**: Ensure you're logged in as an administrator or moderator. Regular users cannot mark topics as important.

### Issue: Important badge doesn't show after marking
**Solution**: Hard refresh the page (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac) to clear cached templates.

### Issue: Reading list shows empty even with important topics
**Solution**: Verify topics are marked as important by checking the topic page for the important badge. Rebuild the forum with `./nodebb build` if needed.

### Issue: Changes don't appear after marking/unmarking
**Solution**: After making code changes, always rebuild and restart:
```bash
./nodebb build
./nodebb restart
```

## Support and Feedback

For issues or questions about the Important Pin feature:
1. Check this guide first
2. Run the automated test suite to verify functionality
3. Review the test output for specific error messages
4. Check the implementation files listed in commit messages for technical details

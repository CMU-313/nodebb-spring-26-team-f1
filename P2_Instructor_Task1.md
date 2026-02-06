# Topic Resolution Status Feature - Implementation Plan

## Overview
Add resolution tracking to topics with automatic resolution when instructor/TA replies, enabling instructors and TAs to track resolved student questions.

## Requirements Analysis
1. **DB Schema**: Add `isResolved`, `resolvedAt`, and `resolvedBy` fields to topics
2. **Existing Data**: Default to `isResolved: false` for existing topics
3. **Auto-Resolution**: Instructor/TA replies trigger automatic resolution
4. **Student Replies**: Student replies do NOT auto-resolve
5. **Migration**: Proper upgrade script needed
6. **Indexes**: Add indexes for efficient querying

## Files to Modify

### 1. Database Schema & Migration
**File**: `src/upgrades/{version}/add-topic-resolution.js`
- Create new upgrade script to add fields to all existing topics
- Initialize `isResolved = false`, `resolvedAt = null`, `resolvedBy = null`
- Create indexes on `isResolved` and `resolvedAt` for efficient querying
- Handle both MongoDB and PostgreSQL

### 2. Topic Data Layer
**File**: `src/topics/data.js`
- Add `isResolved`, `resolvedAt`, `resolvedBy` to `intFields` array for proper parsing
- These fields should be included in default topic retrieval

### 3. Topic Creation
**File**: `src/topics/create.js`
- Initialize new fields when topic is created:
  - `isResolved: false`
  - `resolvedAt: null`
  - `resolvedBy: null`

### 4. Post Creation with Auto-Resolution
**File**: `src/posts/create.js`
- After post creation, check if user is instructor/TA
- If yes and post is a reply (has `toPid`), auto-resolve the topic:
  - Set `isResolved = true`
  - Set `resolvedAt = timestamp`
  - Set `resolvedBy` to user data (uid + role)
- Add hook to allow plugins to interfere with resolution logic

### 5. Helper Functions
**New File**: `src/topics/resolve.js` or add to existing files
- Helper function to check if user is instructor or TA in the category
- Function to mark topic as resolved with audit trail
- Separate logic for checking user roles (isModerator, isAdmin, etc.)

## Implementation Steps

### Step 1: Create Migration Script
- File: `src/upgrades/{version}/add-topic-resolution.js`
- Uses existing upgrade pattern
- Adds null-safe operations for all existing topics
- Creates indexes on new fields

### Step 2: Update Topic Schema Handling
- Modify `src/topics/data.js` to parse new fields
- Ensure fields are treated as proper data types (boolean, timestamp, object)

### Step 3: Update Topic Creation
- Modify `src/topics/create.js` to initialize resolution fields

### Step 4: Implement Auto-Resolution Logic
- Modify `src/posts/create.js` to:
  1. Get user roles for the category after post creation
  2. Check if user is instructor/TA (using existing privilege system)
  3. If yes, mark topic as resolved

### Step 5: Add Helper Functions
- Create role-checking logic to determine if user should auto-resolve
- Make logic extendable via hooks

## Key Technical Decisions

### Role Detection Strategy
- Use existing privilege system: `user.isModerator()`, `user.isAdmin()`
- Or check group membership for 'instructor' and 'ta' groups
- Store role information in `resolvedBy` field as JSON: `{uid: X, role: 'instructor'}`

### Database Fields
- `isResolved`: Boolean (0/1 in SQL, true/false in Mongo)
- `resolvedAt`: Integer timestamp (milliseconds)
- `resolvedBy`: String/JSON storing uid and role info

### Indexing
- Create index on `isResolved` for quick filtering of resolved/unresolved topics
- Create index on `resolvedAt` for sorting by resolution time
- Composite index on `isResolved` + `resolvedAt` for range queries

## Acceptance Criteria Checklist
- [ ] Migration script creates new fields on all existing topics
- [ ] Existing topics default to `isResolved: false`
- [ ] Instructor/TA reply auto-marks topic as resolved
- [ ] Student reply does NOT auto-mark as resolved
- [ ] Database indexes are created
- [ ] Fields persist correctly across restarts
- [ ] No breaking changes to existing APIs

## Database Implementation Considerations

### MongoDB
- Uses simple object field operations
- Indexes created via `db.createIndex()`

### PostgreSQL
- May need schema migrations if using relational structure
- Need to handle NULL values properly
- Need to ensure compatibility with existing data

## Testing Checklist
- [ ] Create topic -> verify fields initialized
- [ ] Existing topics -> verify fields set to defaults
- [ ] Student reply -> verify topic NOT resolved
- [ ] Instructor reply -> verify topic auto-resolved
- [ ] TA reply -> verify topic auto-resolved
- [ ] Query performance -> verify indexes work

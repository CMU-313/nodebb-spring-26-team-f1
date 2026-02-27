# Assignment Tags - Instructor Guide

## Welcome!

Assignment Tags help you organize and categorize course posts, making it easier for students to find relevant content. This guide will walk you through everything you need to know about creating and managing tags.

---

## What are Assignment Tags?

Assignment Tags are colored labels you can attach to posts to categorize them by:
- **Assignment type** (Homework, Lab, Project, Exam)
- **Topic** (Algorithms, Data Structures, Machine Learning)
- **Status** (Required, Optional, Extra Credit)
- **Difficulty** (Beginner, Intermediate, Advanced)
- Or any custom categories that fit your course!

### Benefits

- **Better Organization:** Students can quickly identify post types at a glance
- **Easy Filtering:** Filter posts by specific tags to focus on relevant content
- **Visual Clarity:** Color-coded tags make navigation intuitive
- **Flexible Categorization:** Create custom tags that match your teaching style

---

## Getting Started

### Prerequisites

- You must be assigned the **Instructor** or **Administrator** role
- Your course must be using PostgreSQL database (check with your system administrator)

### Accessing Tag Management

1. Log in to your course forum
2. Navigate to the **Admin Control Panel** (ACP)
3. Click **Manage** → **Assignment Tags**

You'll see the Assignment Tags management page where you can create, edit, and delete tags.

---

## Creating Your First Tag

### Step 1: Open the Create Tag Dialog

Click the **"Create Tag"** button at the top of the Assignment Tags page.

### Step 2: Fill in Tag Details

**Tag Name** (Required)
- Enter a descriptive name (e.g., "Homework", "Lab", "Discussion")
- Keep it short and clear (max 255 characters)
- This is what students will see on posts

**Color** (Optional)
- Click the color picker to choose a color for your tag
- Or type a hex code directly (e.g., #FF5733)
- Choose colors that are distinct and accessible
- Default color: Blue (#3498db)

**Color Suggestions:**
- 🔴 Red (#FF5733) - Urgent or important assignments
- 🟢 Green (#2ECC71) - Completed or optional content
- 🔵 Blue (#3498db) - General assignments
- 🟡 Yellow (#F39C12) - In-progress or draft
- 🟣 Purple (#9B59B6) - Extra credit or bonus

**Category** (Optional)
- Group similar tags together (e.g., "Assignments", "Materials", "Admin")
- Helps organize your tags when you have many
- Students don't see categories, but they help you manage tags

### Step 3: Save the Tag

Click **"Save Tag"** to create it. The tag will immediately appear in your tags list and become available for use on posts.

---

## Managing Tags

### Viewing All Tags

The Assignment Tags page displays all your tags in a table with:
- Tag name (with color preview)
- Color swatch
- Category
- Creation date
- Action buttons (Edit, Delete)

### Editing a Tag

1. Click the **"Edit"** button next to any tag
2. Modify the name, color, or category
3. Click **"Save Tag"**

**Note:** Changes apply immediately to all posts using this tag. Students will see the updated name and color.

### Deleting a Tag

1. Click the **"Delete"** button next to the tag
2. Confirm the deletion in the popup dialog

**⚠️ Warning:** Deleting a tag removes it from ALL posts. This action cannot be undone. Consider editing the tag instead if you want to rename or recolor it.

### Best Practices for Tag Management

✅ **Do:**
- Create tags at the start of your course
- Use consistent naming (e.g., "HW 1", "HW 2" vs. "Homework1", "hw2")
- Choose distinct, accessible colors
- Limit tags to 10-15 for better usability
- Group related tags using categories

❌ **Don't:**
- Create too many similar tags (e.g., "Homework", "HW", "Assignment" - pick one!)
- Use very similar colors (hard to distinguish)
- Delete tags mid-semester (disrupts organization)
- Use offensive or unclear names

---

## Using Tags on Posts

### Creating a Post with Tags

When creating a new topic or post:

1. Write your post title and content as usual
2. Look for the **"Assignment Tags"** section in the composer
3. Select one or more tags from the dropdown (hold Ctrl/Cmd to select multiple)
4. Submit your post

The tags will appear as colored chips below your post content.

### Adding Tags to Existing Posts

Currently, tags must be assigned when creating a post. To add tags to an existing post, contact your system administrator.

**Future enhancement:** Edit functionality for tags on existing posts is planned.

### Recommended Tagging Strategy

**For Course Staff:**
- Tag all official course content
- Use consistent tags throughout the semester
- Include a legend or guide in a pinned post explaining your tags

**Common Tagging Patterns:**

1. **By Assignment Type:**
   - "Homework" - Problem sets and assignments
   - "Lab" - Lab exercises
   - "Project" - Project-related posts
   - "Exam" - Exam information and reviews

2. **By Course Module:**
   - "Week 1" - Content for specific weeks
   - "Module: Algorithms" - Topic-based organization
   - "Chapter 3" - Textbook chapter alignment

3. **By Status:**
   - "Required" - Must-read content
   - "Optional" - Supplementary material
   - "Archived" - Past content for reference

4. **By Importance:**
   - "📌 Announcement" - Important updates
   - "❓ Q&A" - Question and answer threads
   - "💡 Resource" - Helpful resources

---

## How Students Use Tags

Students interact with tags in several ways:

### Viewing Tags

Tags appear as colored chips on:
- Individual posts (below content)
- Topic lists in categories
- Search results

Each tag displays:
- Tag icon (🏷️)
- Tag name
- Background color you chose

### Filtering by Tags

**Method 1: Click a Tag**
- Students can click any tag chip
- This filters the topic list to show only posts with that tag
- Great for quick filtering

**Method 2: Use the Filter Dropdown**
- On category and topic list pages, there's a "Filter by Assignment Tags" dropdown
- Students can select multiple tags (hold Ctrl/Cmd)
- Click "Apply Filter" to see matching posts
- Shows posts with ANY of the selected tags (OR operation)

**Method 3: URL Bookmarks**
- Students can bookmark filtered views (e.g., `?assignmentTags=1,2`)
- Useful for creating quick links to "All Homework" or "Required Reading"

### Clearing Filters

Students can click **"Clear Filters"** to remove tag filtering and see all posts again.

---

## Example Tag Setup

Here's a sample tag configuration for a computer science course:

| Tag Name | Color | Category | Use Case |
|----------|-------|----------|----------|
| HW 1-10 | #FF5733 | Assignments | Weekly homework |
| Lab 1-5 | #E67E22 | Labs | Lab exercises |
| Project | #8E44AD | Assignments | Course project |
| Exam Prep | #3498DB | Assessments | Exam reviews |
| Lecture Notes | #1ABC9C | Materials | Lecture resources |
| Reading | #16A085 | Materials | Required reading |
| Discussion | #27AE60 | Participation | Discussion prompts |
| Announcement | #C0392B | Admin | Important updates |
| FAQ | #2C3E50 | Admin | Common questions |
| Extra Credit | #F39C12 | Optional | Bonus opportunities |

### Sample Workflow

**Week 1:**
1. Create tags for the semester
2. Pin a post explaining your tagging system
3. Tag all initial course materials

**Throughout Semester:**
1. Tag each post as you create it
2. Encourage TAs to use consistent tags
3. Update tag colors if needed (e.g., mark completed assignments gray)

**Student Perspective:**
1. Student wants to see all homework: Clicks "HW" tag or uses filter dropdown
2. Student preparing for exam: Clicks "Exam Prep" tag
3. Student looking for lecture notes: Filters by "Lecture Notes"

---

## Tips & Tricks

### For Better Organization

1. **Create a Tag Legend**
   - Pin a post at the top explaining your tags
   - Include color meanings and usage
   - Update it as you add tags

2. **Use Numbers in Tags**
   - "HW 1", "HW 2" makes sequencing clear
   - Better than "Homework Assignment One"

3. **Combine Multiple Tags**
   - Posts can have multiple tags
   - Example: ["HW 3", "Week 5", "Algorithms"]
   - Gives students multiple ways to find content

4. **Archive Old Content**
   - Create an "Archive" tag for past semesters
   - Helps students focus on current material

### For Accessibility

1. **Don't Rely on Color Alone**
   - Always use clear tag names
   - Color is supplementary, not primary identification

2. **Choose High-Contrast Colors**
   - Ensure text is readable on tag backgrounds
   - White text works best on most colors

3. **Test on Mobile**
   - View your tags on a mobile device
   - Ensure they're readable and not too large

### For Scale

1. **Start Simple**
   - Begin with 5-7 core tags
   - Add more as needed throughout the semester

2. **Review Periodically**
   - Check if tags are being used consistently
   - Merge or delete unused tags

3. **Get Feedback**
   - Ask students if tags are helpful
   - Adjust based on how they're using filters

---

## Troubleshooting

### "I don't see the Assignment Tags menu"

**Possible reasons:**
- You're not assigned the Instructor or Administrator role
- The feature requires PostgreSQL database (you may be using MongoDB)
- Contact your system administrator

### "Tags aren't appearing on posts"

**Check:**
- Did you save the tags when creating the post?
- Are you viewing the full post (not just preview)?
- Try refreshing the page

### "Students can't see tags"

**Verify:**
- Tags are only visible if database is PostgreSQL
- Students need to be logged in to see tags
- Check if posts actually have tags assigned

### "Filter isn't working"

**Try:**
- Clear your browser cache
- Make sure you clicked "Apply Filter"
- Check if any posts actually have that tag

### "I deleted a tag by accident"

Unfortunately, tag deletion is permanent and removes the tag from all posts. You'll need to:
1. Create a new tag with the same name and color
2. Re-assign it to affected posts (contact admin for bulk operations)

**Prevention:** Always confirm before deleting tags!

---

## Frequently Asked Questions

**Q: Can students create tags?**
A: No, only instructors and administrators can create, edit, or delete tags. This ensures consistent organization.

**Q: How many tags can I create?**
A: There's no hard limit, but we recommend 10-15 tags for usability. Too many tags can overwhelm students.

**Q: Can I change tag colors mid-semester?**
A: Yes! Editing a tag's color updates it everywhere immediately. This won't affect tag assignments.

**Q: Do tags affect search?**
A: Tags themselves aren't searchable yet, but posts with tags can still be found via normal search. Tag-based search may be added in future versions.

**Q: Can I export a list of posts by tag?**
A: This feature isn't currently available in the UI. Contact your system administrator for database queries.

**Q: What happens to tags if I restore a post from trash?**
A: Tags are preserved when posts are deleted and restored (soft delete). If the post is permanently deleted, tag assignments are removed.

**Q: Can I see analytics on tag usage?**
A: Not in the current version, but this is a planned feature. For now, you can manually count posts per tag.

---

## Getting Help

### Need More Help?

- **Technical Issues:** Contact your system administrator
- **Feature Requests:** Submit feedback through your institution's support channel
- **Bug Reports:** Report issues to your NodeBB administrator

### Additional Resources

- **API Documentation:** `/docs/assignment-tags-api.md` (for developers)
- **Database Schema:** `/docs/assignment-tags-database-schema.md` (technical reference)
- **Developer Guide:** `/docs/assignment-tags-developer-guide.md` (for customization)

---

## Feedback

We're constantly improving the Assignment Tags feature. If you have suggestions, please share them with your system administrator!

**Common requests we're considering:**
- Tag analytics dashboard
- Bulk tag assignment/editing
- Tag templates for common course structures
- Tag-based notifications
- Student tag suggestions (with instructor approval)

---

## Quick Reference Card

### Creating a Tag
1. Admin Panel → Manage → Assignment Tags
2. Click "Create Tag"
3. Enter name, choose color, optionally set category
4. Click "Save Tag"

### Editing a Tag
1. Find tag in list
2. Click "Edit"
3. Make changes
4. Click "Save Tag"

### Deleting a Tag
1. Find tag in list
2. Click "Delete"
3. Confirm deletion (⚠️ Cannot be undone!)

### Using Tags on Posts
1. Create/edit post
2. Find "Assignment Tags" section
3. Select tag(s) from dropdown (Ctrl/Cmd for multiple)
4. Submit post

### Filtering by Tags (Student View)
- **Quick:** Click any tag chip
- **Advanced:** Use "Filter by Assignment Tags" dropdown, select multiple, click "Apply Filter"
- **Clear:** Click "Clear Filters" button

---

**Happy Tagging! 🏷️**

*Version 1.0 | Last updated: February 2024*

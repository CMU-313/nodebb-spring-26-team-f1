# User Guide for Reply Notification Popups

## Overview

This document provides instructions for using and testing the **reply notification popup feature** implemented in this project. The feature ensures that when a user replies to a topic, the original poster receives a **real-time popup notification**. It also prevents users from receiving notifications when replying to their own posts.


## Features

1. **Real-time notifications**
   - Sends a popup alert to the original poster when someone replies to their topic or post.
   - Uses the existing **socket server infrastructure** to deliver notifications instantly.
   
2. **Edge-case handling**
   - Notifications are only sent for **non-self replies**.
   - Ensures that notifications are only triggered for **reply posts**, not main topic posts.

3. **Clickable notifications**
   - Clicking on the popup takes the user directly to the reply within the topic.
   - Popup displays:
     - Title: `Reply!`
     - Message: `"There is a reply in: [topic title]"`  
     - Optional excerpt if provided  
     - Timeout (default 5 seconds)


## How to Use

### 1. Replying to a topic
1. Log in as any user.  
2. Navigate to a topic and post a reply.  
3. If you are **not the original poster**, the original poster will receive a popup notification immediately.

### 2. Viewing notifications
- Notifications appear as a popup on the screen.
  
### 3. Self-reply handling
- If a user replies to their own post, **no notification** is sent.

---

## Testing Your Feature

### Automated Tests Location

- **File:** `test/notifications.js`  
- **Branch:** `notifications/pop-up/topics`

### What is being tested

1. **Notification triggering**
 - Test that a reply by a second user triggers a notification to the original poster.
 
2. **Self-reply prevention**
 - Test that a user replying to their own post does **not** trigger a notification.
 
3. **Real-time delivery**
 - Uses a mock socket server to ensure notifications are emitted correctly.


### Why the tests are sufficient

- All key paths of the new feature are covered:
- Replying to a topic  
- Replying to a post  
- Self-reply  
- Edge cases like missing topic ID or post ID are implicitly handled by early returns in the implementation.

---

## Manual / UI Testing

1. **Setup**
 - Create two users: Original Poster and Replier.  
 - Original Poster creates a topic.

2. **Test steps**
 - Log in as Replier and post a reply to the topic.
 - Observe that the Original Poster sees a popup notification.
 - Click the notification to confirm that it navigates to the reply post.

3. **Expected results**
 - Original Poster receives exactly one notification.  
 - Self-replies do not trigger a notification.  
 - Popup displays message and optional excerpt correctly.

### Running Specific Tests

You can run only the reply notification tests using the `--grep` option with Mocha:

```bash
./node_modules/.bin/mocha test/notifications.js --grep "reply notification"




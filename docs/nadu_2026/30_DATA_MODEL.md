# 30_DATA_MODEL.md
_עודכן לאחרונה: 2026-01-08_

## מטרה
להגדיר את מודל הנתונים המלא של NADU: Collections, Documents, Fields, Indexes, ו-Security Rules structure.

זה מסמך **HOW** (מבנה הנתונים בפועל).

---

## עקרונות Data Model

### 1. NoSQL Best Practices
- **Denormalization** - נתונים חוזרים לביצועים
- **Subcollections** - לנתונים מקוננים (comments, messages)
- **Array fields** - למערכים קטנים (tags, participants)
- **Maps** - למפות קטנות (privacy settings, stats)

### 2. Immutable Fields
```typescript
// שדות שאינם ניתנים לשינוי לעולם:
- uid (Firebase Auth)
- createdAt (server timestamp)
- sex (gender - נעול לצמיתות)
- dob (date of birth - נעול לצמיתות)
```

### 3. Semi-Immutable Fields
```typescript
// שדות עם הגבלות שינוי:
- username (שינוי כל 30 יום)
- email (שינוי עם אימות כפול)
```

### 4. Timestamps
```typescript
// כל document מכיל:
createdAt: FieldValue.serverTimestamp()
updatedAt: FieldValue.serverTimestamp()
```

---

## Collections Schema

### 1. users/{uid}

**Purpose:** Identity, roles, core user data

```typescript
interface User {
  // Identity
  uid: string;                    // Firebase Auth UID
  email: string;                  // Email (verified)
  phoneNumber?: string;           // Phone (optional, verified)
  username: string;               // Unique, 3-20 chars, changeable every 30 days
  displayName: string;            // Public display name

  // Immutable
  sex: 'male' | 'female' | 'other'; // Gender - LOCKED FOREVER
  dob: Timestamp;                 // Date of birth - LOCKED FOREVER
  age: number;                    // Calculated from dob

  // Profile
  role: 'dom' | 'sub' | 'switch' | 'curious' | 'other';
  orientation?: 'straight' | 'gay' | 'bisexual' | 'other';
  location?: {
    region: string;               // Required: North, Center, South, etc.
    city?: string;                // Optional
  };
  bio?: string;                   // Max 1000 chars
  interests?: string[];           // Max 10 interests
  photoURL?: string;              // Profile photo (Cloud Storage URL)

  // System
  roles: {
    admin?: boolean;              // Admin flag (Custom Claim)
    moderator?: boolean;          // Moderator flag (Custom Claim)
    verified?: boolean;           // Verified badge
    premium?: boolean;            // Premium subscription
  };

  // Status
  online: boolean;                // Currently online
  lastSeen: Timestamp;            // Last activity
  tenureDays: number;             // Days since registration (for gating)

  // Privacy
  privacy: {
    showCity: boolean;            // Show city in profile (default: false)
    allowDMs: boolean;            // Allow direct messages (default: true)
    showOnlineStatus: boolean;    // Show online status (default: true)
  };

  // Metadata
  createdAt: Timestamp;           // Registration date
  updatedAt: Timestamp;           // Last profile update
  usernameLastChanged?: Timestamp; // Last username change (for 30-day rule)

  // Counters (denormalized)
  stats: {
    posts: number;                // Total posts created
    comments: number;             // Total comments
    likes: number;                // Total likes received
  };

  // Flags
  flags: {
    banned?: boolean;             // Banned by admin
    shadowBanned?: boolean;       // Shadow banned
    reported?: boolean;           // Has active reports
  };
}
```

**Indexes:**
```json
// firestore.indexes.json
{
  "collectionGroup": "users",
  "fields": [
    { "fieldPath": "role", "order": "ASCENDING" },
    { "fieldPath": "location.region", "order": "ASCENDING" },
    { "fieldPath": "online", "order": "DESCENDING" }
  ]
}
```

---

### 2. profiles/{uid} (Optional Split)

**Purpose:** Extended profile data (optional optimization)

```typescript
interface Profile {
  uid: string;                    // Reference to users/{uid}

  // Extended Bio
  longBio?: string;               // Extended bio (max 5000 chars)
  lookingFor?: string;            // What I'm looking for
  experience?: string;            // BDSM experience level

  // Media
  photos: string[];               // Additional photos (max 10)
  photosPrivate: string[];        // Private photos (requires permission)

  // Preferences
  preferences: {
    language: 'he' | 'en';        // UI language
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      newMessages: boolean;
      newComments: boolean;
      newLikes: boolean;
    };
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Note:** Profile split הוא אופציונלי. אפשר לשמור הכל ב-users/{uid}.

---

### 3. posts/{postId}

**Purpose:** Forum posts, blog posts

```typescript
interface Post {
  postId: string;                 // Auto-generated

  // Author
  authorUid: string;              // Creator UID
  authorUsername: string;         // Denormalized (for display)
  isAnonymous: boolean;           // Anonymous post?

  // Content
  title: string;                  // Max 200 chars
  content: string;                // Max 10000 chars (rich text)
  contentHtml?: string;           // Rendered HTML (sanitized)

  // Classification
  forumId?: string;               // Which forum (if forum post)
  type: 'forum' | 'blog' | 'seeking';
  tags?: string[];                // Max 5 tags

  // Media
  mediaRefs?: {
    type: 'image' | 'video';
    url: string;                  // Cloud Storage URL
    thumbnail?: string;
  }[];

  // Visibility
  visibility: 'public' | 'members' | 'premium' | 'private';

  // Status
  status: 'active' | 'deleted' | 'flagged' | 'removed';

  // Moderation
  flagged: boolean;               // Flagged for review
  flagReason?: string;
  moderatedBy?: string;           // Admin UID who moderated
  moderatedAt?: Timestamp;

  // Stats (denormalized)
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  editedAt?: Timestamp;           // Last edit (15-min window)

  // Pinned (for forums)
  pinned?: boolean;
  pinnedAt?: Timestamp;
}
```

**Subcollections:**
- `posts/{postId}/comments/{commentId}`
- `posts/{postId}/reactions/{uid}`

**Indexes:**
```json
{
  "collectionGroup": "posts",
  "fields": [
    { "fieldPath": "forumId", "order": "ASCENDING" },
    { "fieldPath": "pinned", "order": "DESCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

### 4. posts/{postId}/comments/{commentId}

**Purpose:** Nested comments on posts

```typescript
interface Comment {
  commentId: string;              // Auto-generated
  postId: string;                 // Parent post

  // Author
  authorUid: string;
  authorUsername: string;         // Denormalized
  isAnonymous: boolean;

  // Content
  content: string;                // Max 2000 chars
  contentHtml?: string;

  // Threading
  parentCommentId?: string;       // If reply to comment
  depth: number;                  // Nesting level (max 3)

  // Status
  status: 'active' | 'deleted' | 'removed';

  // Stats
  stats: {
    likes: number;
    replies: number;
  };

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  editedAt?: Timestamp;           // 15-min window
}
```

---

### 5. chats/{chatId}

**Purpose:** Lobby, rooms, instant DMs (purple)

```typescript
interface Chat {
  chatId: string;                 // Auto-generated or deterministic (for DMs)

  // Type
  type: 'lobby' | 'room' | 'dm';

  // Metadata
  title?: string;                 // For rooms only
  description?: string;
  createdBy: string;              // Creator UID

  // Participants
  participants: string[];         // Array of UIDs
  participantsCount: number;      // Denormalized count

  // Settings
  settings: {
    ephemeral: boolean;           // Delete messages after N days
    retentionDays?: number;       // If ephemeral
    allowMedia: boolean;
    maxMembers?: number;
  };

  // Last Message (denormalized)
  lastMessage?: {
    text: string;
    senderUid: string;
    senderUsername: string;
    timestamp: Timestamp;
  };
  lastMessageAt?: Timestamp;

  // Unread (per user)
  unreadCount: {
    [uid: string]: number;
  };

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcollections:**
- `chats/{chatId}/members/{uid}` - Membership details
- `chats/{chatId}/messages/{messageId}` - Messages

**Indexes:**
```json
{
  "collectionGroup": "chats",
  "fields": [
    { "fieldPath": "participants", "arrayConfig": "CONTAINS" },
    { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
  ]
}
```

---

### 6. chats/{chatId}/messages/{messageId}

**Purpose:** Chat messages

```typescript
interface ChatMessage {
  messageId: string;              // Auto-generated
  chatId: string;                 // Parent chat

  // Sender
  senderUid: string;
  senderUsername: string;         // Denormalized

  // Content
  text: string;                   // Max 2000 chars
  mediaUrl?: string;              // Image/video attachment

  // Threading
  replyTo?: {
    messageId: string;
    text: string;                 // Quoted text
  };

  // Status
  status: 'active' | 'deleted';

  // Timestamps
  createdAt: Timestamp;
  deletedAt?: Timestamp;

  // Read receipts (for DMs)
  readBy?: {
    [uid: string]: Timestamp;
  };
}
```

---

### 7. mailboxThreads/{threadId}

**Purpose:** Red messages (mailbox-style, asynchronous)

```typescript
interface MailboxThread {
  threadId: string;               // Auto-generated

  // Participants
  participants: string[];         // [uidA, uidB]

  // Metadata
  subject?: string;               // Optional subject

  // Last Message (denormalized)
  lastMessage: {
    text: string;
    senderUid: string;
    timestamp: Timestamp;
  };
  lastMessageAt: Timestamp;

  // Unread (per user)
  unread: {
    [uid: string]: number;
  };

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcollections:**
- `mailboxThreads/{threadId}/messages/{messageId}`

---

### 8. groups/{groupId}

**Purpose:** User groups

```typescript
interface Group {
  groupId: string;

  // Metadata
  name: string;
  description?: string;
  avatarUrl?: string;

  // Creator
  createdBy: string;              // UID

  // Visibility
  visibility: 'public' | 'members' | 'private';

  // Membership
  memberCount: number;
  maxMembers?: number;

  // Settings
  settings: {
    allowPosts: boolean;
    requireApproval: boolean;
  };

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcollections:**
- `groups/{groupId}/members/{uid}` - Member roles

---

### 9. reports/{reportId}

**Purpose:** User/content reports

```typescript
interface Report {
  reportId: string;

  // Reporter
  reporterUid: string;
  reporterUsername: string;       // Denormalized

  // Target
  targetType: 'user' | 'post' | 'comment' | 'chatMessage' | 'dmMessage';
  targetId: string;               // UID or document ID
  targetRef?: string;             // Full path (for easy lookup)

  // Content
  category: 'harassment' | 'spam' | 'inappropriate' | 'illegal' | 'other';
  description: string;            // User explanation

  // Evidence (snapshot)
  evidence?: {
    text?: string;                // Content at time of report
    mediaUrl?: string;
    timestamp: Timestamp;
  };

  // Status
  status: 'open' | 'triaged' | 'actioned' | 'closed' | 'dismissed';

  // Moderation
  assignedTo?: string;            // Moderator UID
  moderatorNotes?: string;
  outcome?: string;               // Action taken
  resolvedAt?: Timestamp;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
```json
{
  "collectionGroup": "reports",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

### 10. moderationActions/{actionId}

**Purpose:** Admin/moderator actions audit log

```typescript
interface ModerationAction {
  actionId: string;

  // Actor
  actorUid: string;               // Admin/mod UID
  actorUsername: string;

  // Target
  targetType: 'user' | 'content';
  targetUid?: string;             // If user action
  targetRef?: string;             // If content action

  // Action
  actionType: 'warn' | 'mute' | 'timeout' | 'ban' | 'shadowban' | 'delete' | 'restore';
  reason: string;
  duration?: number;              // In seconds (for timeout/mute)

  // Context
  relatedReportId?: string;
  evidenceRefs?: string[];        // Links to evidence

  // Timestamps
  createdAt: Timestamp;
  expiresAt?: Timestamp;          // For temporary actions
}
```

---

## Security Rules Structure

### Pattern: Read/Write Separation
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }

    function isModerator() {
      return isAuthenticated() &&
        (request.auth.token.role == 'admin' ||
         request.auth.token.role == 'moderator');
    }

    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }

    // Users collection
    match /users/{uid} {
      // Read: own profile + public profiles
      allow read: if isAuthenticated() &&
        (isOwner(uid) || resource.data.privacy.showProfile != false);

      // Write: BLOCKED (use Cloud Functions)
      allow write: if false;
    }

    // Posts collection
    match /posts/{postId} {
      // Read: based on visibility
      allow read: if isAuthenticated() &&
        (resource.data.visibility == 'public' ||
         isAdmin());

      // Write: BLOCKED (use Cloud Functions)
      allow write: if false;
    }

    // Admin-only collections
    match /reports/{reportId} {
      allow read: if isModerator();
      allow write: if false; // Use Functions
    }

    match /moderationActions/{actionId} {
      allow read: if isModerator();
      allow write: if false; // Use Functions
    }
  }
}
```

---

## Composite Indexes

**File:** `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "forumId", "order": "ASCENDING" },
        { "fieldPath": "pinned", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "authorUid", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "chats",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "participants", "arrayConfig": "CONTAINS" },
        { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "targetType", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Deploy:** `firebase deploy --only firestore:indexes`

---

## Data Migration Strategy

### Phase 1: Users
```typescript
// Import users from old system
// Map: old_id → Firebase UID
// Preserve: username, email, profile data
// New: Custom Claims, privacy settings
```

### Phase 2: Content
```typescript
// Import: posts, comments
// Transform: BBCode → Tiptap JSON
// Preserve: authorUid, timestamps, stats
```

### Phase 3: Messages
```typescript
// Import: DMs, chat history
// Group by participants
// Preserve: order, read status
```

---

## Definition of Done

Data Model מוכן כאשר:
- ✅ כל Collections מוגדרות
- ✅ TypeScript interfaces כתובות
- ✅ Security Rules נבדקו באמולטור
- ✅ Composite Indexes מועלים ל-Firebase
- ✅ Migration strategy מוגדרת
- ✅ קוד דוגמה לכל CRUD operation

---

## הערות

- מסמך זה הוא living document - מתעדכן עם התפתחות
- שינויים ב-schema דורשים migration plan
- תמיד להשתמש ב-FieldValue.serverTimestamp() ל-timestamps
- Denormalization צריך להיות מכוון וממוקד

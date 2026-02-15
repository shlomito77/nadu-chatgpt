# 30_DATA_MODEL.md - Firestore Schema & Types
_Status: DRAFT_

This document defines the detailed Firestore schema and TypeScript interfaces for the application.

## 1. Overview
The database follows a **Client Reads, Server Writes** pattern for core entities.
- **Reads**: Clients query collections directly using `onSnapshot` or `getDocs`.
- **Writes**: Clients call Cloud Functions (`createPost`, `sendMessage`, etc.) which validate and write to Firestore.
- **Rules**: Firestore Rules enforce read permissions. Write permissions are handled by Functions (admin SDK bypasses rules, but app logic enforces them).

## 2. Shared Types

```typescript
// Common timestamp fields for all documents
interface Timestamps {
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Basic image structure
interface ImageInfo {
  url: string;
  path: string; // Storage path for deletion
  width?: number;
  height?: number;
}
```

## 3. Collections

### `users/{uid}`
Public profile information. Sensitive data is kept in private sub-collections or strictly controlled by rules.

```typescript
interface UserDoc extends Timestamps {
  uid: string;
  email: string; // PII - visible only to owner/admin via rules
  displayName: string;
  photoURL?: string;
  bio?: string;

  // Location
  region?: string;

  // Age Verification
  dob: string; // ISO date string (YYYY-MM-DD)
  age: number; // Calculated by server

  // Status
  lastSeen?: FirebaseFirestore.Timestamp;
  isOnline?: boolean;

  // Privacy Settings (Client-side usage, effectively)
  privacy: {
    showAge: boolean;
    showLocation: boolean;
    allowDMs: boolean;
  };

  // Trust & Safety
  isVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
  flags: {
    isBanned: boolean;
    isShadowBanned: boolean;
  };
}
```

#### Sub-collections
- `private/profile`: Contains real email, phone, PII not sharable.
- `notifications/{notificationId}`: User notifications.

---

### `posts/{postId}`
Main content feed.

```typescript
interface PostDoc extends Timestamps {
  id: string;
  authorUid: string;

  // Denormalized Author Info (snapshot at creation)
  authorDisplayName: string;
  authorPhotoURL?: string;

  // Content
  title: string;
  content: string; // Plain text or Markdown
  images?: ImageInfo[];

  // Metadata
  isAnonymous: boolean; // If true, UI hides author info, but DB keeps it
  visibility: 'public' | 'members';
  tags: string[];

  // Metrics (Counter shards recommended for high scale, simple increment for MVP)
  commentCount: number;
  likeCount: number;

  // Sorting
  score: number; // Calculated ranking score
}
```

#### Sub-collections
- `comments/{commentId}`

---

### `posts/{postId}/comments/{commentId}`
Comments on a specific post.

```typescript
interface CommentDoc extends Timestamps {
  id: string;
  postId: string;
  authorUid: string;
  authorDisplayName: string;
  authorPhotoURL?: string;

  content: string;

  // Threading (Optional for MVP, flat structure is simpler)
  parentId?: string;
}
```

---

### `chats/{chatId}`
1:1 Private Messaging conversations.

```typescript
interface ChatDoc extends Timestamps {
  id: string;
  type: 'dm';
  participantUids: string[]; // [uid1, uid2]

  // Metadata for list view
  lastMessage?: {
    content: string;
    senderUid: string;
    sentAt: FirebaseFirestore.Timestamp;
    isRead: boolean; // complicated for 2 users, usually requires a map
  };

  // Read status per user
  readStatus: {
    [uid: string]: {
      lastReadAt: FirebaseFirestore.Timestamp;
      unreadCount: number;
    };
  };
}
```

#### Sub-collections
- `messages/{messageId}`

---

### `chats/{chatId}/messages/{messageId}`
Individual messages in a chat.

```typescript
interface MessageDoc extends Timestamps {
  id: string;
  chatId: string;
  senderUid: string;
  content: string;

  // Attachments (Phase 2, maybe MVP)
  // type: 'text' | 'image';
  // media?: ImageInfo;
}
```

---

### `reports/{reportId}`
System-wide reports for moderation.

```typescript
interface ReportDoc extends Timestamps {
  id: string;
  reporterUid: string;

  // Target
  targetType: 'post' | 'comment' | 'user' | 'message';
  targetId: string;
  targetRef: string; // full path: posts/123

  // Snapshot of content at time of report
  snapshot: {
    content?: string;
    authorUid?: string;
    // ...other relevant fields
  };

  reason: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';

  // Resolution
  resolution?: {
    action: 'ban' | 'warn' | 'delete_content' | 'none';
    moderatorUid: string;
    resolvedAt: FirebaseFirestore.Timestamp;
    notes?: string;
  };
}
```

---

### `moderationActions/{actionId}`
Audit log of all admin/moderator actions.

```typescript
interface ModerationActionDoc extends Timestamps {
  id: string;
  actorUid: string;
  actorRole: 'admin' | 'moderator';

  actionType: 'ban_user' | 'delete_post' | 'dismiss_report';
  targetType: 'user' | 'post' | 'report';
  targetId: string;

  reason: string;
  metadata?: Record<string, any>; // Extra info
}
```

## 4. Indexes (firestore.indexes.json)

Required composite indexes:

1. **Feed**: `posts` -> `visibility` Asc + `createdAt` Desc
2. **User Posts**: `posts` -> `authorUid` Asc + `createdAt` Desc
3. **Chat List**: `chats` -> `participantUids` ArrayContains + `updatedAt` Desc
4. **Reports**: `reports` -> `status` Asc + `createdAt` Desc

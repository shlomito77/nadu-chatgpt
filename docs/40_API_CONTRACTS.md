# 40_API_CONTRACTS.md - Cloud Functions API
_Status: DRAFT_

This document defines the Callable Cloud Functions API for the NADU application.

## 1. Overview
All write operations to core entities (Post, Comment, Chat, Report) MUST go through these functions.
- **Protocol**: Firebase Callable Functions (HTTPS).
- **Auth**: `context.auth` is required for all endpoints unless specified otherwise.
- **Validation**: Strict schema validation using Zod or equivalent on the backend.

## 2. Common Types

```typescript
interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## 3. Auth & User Management

### `onUserCreate` (Trigger)
- **Type**: `functions.auth.user().onCreate`
- **Purpose**: Creates the user document in Firestore and sets default claims.
- **Input**: `UserRecord` (Firebase Auth)
- **Output**: `Promise<void>`
- **Side Effects**:
  - Creates `users/{uid}`.
  - Sets `customClaims` (`role: 'user'`, `isVerified: false`).

### `updateProfile`
- **Type**: Callable
- **Input**:
  ```typescript
  interface UpdateProfileRequest {
    displayName?: string;
    bio?: string;
    photoURL?: string;
    privacy?: {
      showAge?: boolean;
      showLocation?: boolean;
    };
  }
  ```
- **Output**: `ApiResponse<UserDoc>`
- **Permissions**: Owner only.

## 4. Posts & Content

### `createPost`
- **Type**: Callable
- **Input**:
  ```typescript
  interface CreatePostRequest {
    title: string;
    content: string;
    visibility: 'public' | 'members';
    isAnonymous?: boolean;
    tags?: string[];
    imagePaths?: string[]; // uploaded to storage first
  }
  ```
- **Output**: `ApiResponse<{ postId: string }>`
- **Validation**:
  - `title`: 5-100 chars.
  - `content`: 10-5000 chars.
  - `tags`: max 5 tags.

### `deletePost`
- **Type**: Callable
- **Input**: `{ postId: string }`
- **Output**: `ApiResponse<void>`
- **Permissions**: Owner or Admin/Moderator.

### `createComment`
- **Type**: Callable
- **Input**:
  ```typescript
  interface CreateCommentRequest {
    postId: string;
    content: string;
    parentId?: string; // for nested comments
  }
  ```
- **Output**: `ApiResponse<{ commentId: string }>`

## 5. Messaging (Chat)

### `createChat` (or `getOrCreateChat`)
- **Type**: Callable
- **Input**: `{ targetUid: string }`
- **Output**: `ApiResponse<{ chatId: string }>`
- **Logic**:
  - Checks if a DM already exists between `auth.uid` and `targetUid`.
  - If yes, returns existing `chatId`.
  - If no, creates new document in `chats`.

### `sendMessage`
- **Type**: Callable
- **Input**:
  ```typescript
  interface SendMessageRequest {
    chatId: string;
    content: string;
    type?: 'text' | 'image';
  }
  ```
- **Output**: `ApiResponse<{ messageId: string }>`
- **Logic**:
  - Verifies user is a participant.
  - Adds message to sub-collection.
  - Updates `lastMessage` and `updatedAt` on parent chat document.
  - Increments unread count for recipient.

### `markMessagesRead`
- **Type**: Callable
- **Input**: `{ chatId: string }`
- **Output**: `ApiResponse<void>`

## 6. Trust & Safety

### `createReport`
- **Type**: Callable
- **Input**:
  ```typescript
  interface CreateReportRequest {
    targetType: 'post' | 'comment' | 'user' | 'message';
    targetId: string;
    reason: string; // e.g., 'spam', 'harassment'
    description?: string; // optional details
  }
  ```
- **Output**: `ApiResponse<{ reportId: string }>`
- **Logic**:
  - Snapshots the content (if available).
  - Creates document in `reports`.

### `resolveReport` (Admin)
- **Type**: Callable
- **Input**:
  ```typescript
  interface ResolveReportRequest {
    reportId: string;
    action: 'ban' | 'warn' | 'delete_content' | 'dismiss';
    notes?: string;
  }
  ```
- **Output**: `ApiResponse<void>`
- **Permissions**: `context.auth.token.role` must be `'admin'` or `'moderator'`.

## 7. Error Codes

| Code | Description |
|---|---|
| `unauthenticated` | User is not logged in. |
| `permission-denied` | User lacks necessary role or ownership. |
| `invalid-argument` | Input validation failed (Zod error). |
| `not-found` | Target resource does not exist. |
| `resource-exhausted` | Rate limit exceeded. |
| `internal` | Server error. |

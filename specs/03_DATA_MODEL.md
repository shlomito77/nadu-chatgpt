# 03_DATA_MODEL — מודל נתונים (ברמת מוצר)
_גרסת GOLD: 2026-01-12_

> זהו מודל “מה קיים” (Product). המימוש הטכני המלא נמצא ב‑/docs.

## Collections (MVP)
### users/{uid}
שדות ליבה:
- identity: `uid`, `email`, `displayName`, `photoURL?`
- age: `dob` (נעול), `age` מחושב
- system: `createdAt`, `updatedAt`
- status: `lastSeen`, `online?`
- privacy: `privacy.*`
- flags: `flags.banned?`, `flags.shadowBanned?`

### posts/{postId}
- `authorUid` (פנימי), `authorUsername`/`displayName` (denorm)
- `isAnonymous`
- `title`, `content` (rich text), `contentHtml?` (sanitized)
- `visibility`
- `tags[]` (מוגבל)
- timestamps: `createdAt`, `updatedAt`
Subcollections:
- `comments/{commentId}`

### chats/{chatId}  (1:1 MVP)
- `type: 'dm'`
- `participants: [uidA, uidB]`
- timestamps
Subcollections:
- `messages/{messageId}`

### reports/{reportId}
- `targetType`, `targetRef`
- `reporterUid`
- `snapshot` (קופסה מינימלית של הטקסט/מטא)
- `status`, timestamps

### moderationActions/{actionId}
- `actorUid`, `actorRole`
- `actionType`, `reason`
- `targetRef`
- timestamps

## אינדקסים מינימליים (MVP)
- posts: `visibility + createdAt` (feed)
- comments: `postId + createdAt`
- chats: `participants (array-contains) + updatedAt`
- messages: `chatId + createdAt`

## כללי Denormalization
- שומרים displayName/username בפוסט/הודעה כדי להימנע מקריאות נוספות.
- counters (optional): `users/{uid}.stats.*` רק אם צריך.

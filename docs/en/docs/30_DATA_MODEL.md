# 30 — Data Model (Technical)

**Last updated:** 2026-01-07  
**Type:** HOW (data shapes & collections)

## 1. Core collections
### users/{uid}
- username, role, gender, dob, createdAt
- profile fields (bio, preferences, badges later)
- privacy settings (visibility, screenshot policy flags)
- tenureDays (derived) or computed on client

### posts/{postId}
- authorUid (hidden for anonymous to users)
- isAnonymous (bool)
- body, mediaRefs, createdAt
- counters: likeCount, commentCount
- visibility (public to members) + future filters

### posts/{postId}/comments/{commentId}
- authorUid, isAnonymous
- parentCommentId (optional for threading)
- body, createdAt

### chats/{chatId}
- type: lobby | room
- createdByUid
- members (for rooms) or “all members” for lobby
- createdAt
- ephemeralPolicy: true

### chats/{chatId}/messages/{messageId}
- senderUid, body, createdAt
- replyToMessageId (optional)
- deletedAt (optional)
- NOTE: for chat we can store and query since sessionStart; purge jobs optional.

### dmThreads/{threadId}
- type: purple | red
- participants: [uidA, uidB]
- createdAt, lastMessageAt

### dmThreads/{threadId}/messages/{messageId}
- senderUid, body, createdAt
- readBy (map uid->timestamp) for purple
- status fields for red (sent/received/read)

### reports/{reportId}
- reporterUid
- targetType: user|post|comment|dm|chatMessage
- targetRef (ids)
- reason, text, createdAt
- status, moderatorUid, resolvedAt, outcome

### blocks/{blockId}
- blockerUid, blockedUid
- createdAt
- mutual = true (policy)

## 2. Indexing notes
- Feed: posts orderBy createdAt desc
- Comments: orderBy createdAt asc, filter by postId
- DMs: threads where participants array-contains uid
- Reports: targetType/status for moderation queue

## 3. IDs & ordering
- Firestore auto-IDs.
- Server timestamps for createdAt/updatedAt.
- Optional clientMessageId for idempotency.


# Firestore schema implementation

> Concrete layout aligned with existing rules + functions approach. Keep this as a *living* map.

## Collections
### users/{uid}
- auth-bound identity + roles + tenure
- **immutable**: dob/age, sex
- **semi-immutable**: username (change every 30 days)
- fields: username, displayName, sex, role, createdAt, updatedAt, roles, flags

### profiles/{uid} (optional split)
- long form bio + preferences + privacy toggles
- fields: bio(<=1000), interests/tags, privacy settings, media refs

### posts/{postId}
- authorUid, visibility, createdAt, content, mediaRefs, isAnonymous
- if anonymous: public-facing author display = "Anonymous" but admin can see authorUid

subcollections:
- posts/{postId}/comments/{commentId}
- posts/{postId}/reactions/{uid}

### groups/{groupId}
- metadata + visibility + createdBy
subcollections:
- groups/{groupId}/members/{uid}

### chats/{chatId}
- type: lobby | room | dm
- createdBy
- title (for room)
- retentionPolicy: persistent | ephemeral (per spec)
subcollections:
- chats/{chatId}/members/{uid}
- chats/{chatId}/messages/{messageId}

### mailboxThreads/{threadId}  (Red messages)
- participants [uid]
- lastMessageAt, subject(optional)
subcollections:
- mailboxThreads/{threadId}/messages/{messageId}

### reports/{reportId}
- reporterUid
- targetType: user|post|comment|chatMessage
- targetRef
- category, description
- status: open|triaged|actioned|closed
- createdAt

### moderationActions/{actionId}
- actorUid (admin/mod)
- actionType: warn|mute|ban|delete|shadowban
- targetUid / targetRef
- reason
- createdAt
- evidenceRefs

## Index guidance
- Don’t over-index. Start with:
  - posts feed by createdAt + visibility
  - chat messages by createdAt
  - mailbox threads by lastMessageAt
Add indexes only when queries demand.

## Retention
- Lobby and rooms: persistent unless spec says ephemeral.
- If ephemeral: use scheduled cleanup (Cloud Scheduler + function) OR TTL-like pattern (store expiresAt and batch delete).

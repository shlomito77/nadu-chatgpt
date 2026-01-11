# 50 — Chat (Technical)

**Last updated:** 2026-01-07  
**Type:** HOW

## 1. Surfaces
- Chat Lobby (public to eligible members)
- Rooms (created by users; optional cap)
- Chat UI is session-based (messages appear “fresh” per session), while storage/purge follows product policy.

## 2. Message write path (recommended)
Client → Cloud Function → Firestore
- Validate membership + tenure
- Validate blocked/report states
- Write message with serverTimestamp
- Optionally emit notification events

## 3. Ephemeral behavior
- Primary UX: “clean lobby after leaving chat”.
- Implementation options:
  A) **No hard delete**: store messages but client queries only “since sessionStart”.
  B) **TTL purge**: scheduled cleanup to delete old chat messages (cost saving).
  Recommended: A in v1, add B if cost requires.

## 4. Reply
- Support reply-to-message pointer (replyToMessageId + snippet).

## 5. Presence
- Lightweight presence via Realtime Database or Firestore heartbeat (optional).
- v1 can omit; show “online” only inside chat.


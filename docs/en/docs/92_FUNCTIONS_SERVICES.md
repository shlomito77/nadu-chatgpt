# Functions & services

## Principles
- **All writes go through Functions** (except safe self-owned docs if explicitly allowed by spec).
- Functions verify:
  - auth (ID token)
  - block rules
  - membership/visibility
  - input validation
  - rate limits

## Function list (minimum set)
### Auth/Profile
- `profileUpsert`
- `usernameChange` (enforce 30-day cooldown)
- `privacyUpdate`

### Chat
- `createChat` (dm/room)
- `joinChat` / `leaveChat`
- `sendMessage`
- `chatEnsureLobbySession` (tenure gate)

### Posts
- `createPost` (supports anonymous)
- `commentCreate` (supports anonymous comments if spec allows)
- `reactionSet`

### Mailbox (Red)
- `threadCreate`
- `threadSendMessage`
- `threadMarkRead`

### Reporting/Moderation
- `reportCreate`
- `moderationActionApply` (admin only)

## Error contract (standard)
Return JSON:
- `{ ok: true, data: ... }`
- `{ ok: false, error: "BAD_REQUEST"|"UNAUTHENTICATED"|"FORBIDDEN"|"NOT_FOUND"|"RATE_LIMIT"|"INTERNAL", message?: string, details?: any }`

## Local emulation
- `firebase emulators:start`
- Seed scripts create users, create chat, send messages.

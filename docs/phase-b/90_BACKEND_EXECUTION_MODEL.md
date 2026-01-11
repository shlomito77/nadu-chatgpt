# Backend execution model

## Target stack (recommended)
- **Firebase Auth** for identity (Email+Password + Phone verify; Google; Apple)
- **Firestore** for product data
- **Cloud Functions (2nd gen)** for **all mutations** (write API)
- Clients read Firestore directly (with strict rules), but write through Functions.

## Why this model
- Matches the “specs are law” approach: server enforces invariants, rate limits, moderation hooks.
- Keeps Firestore rules simple and restrictive.
- Makes abuse prevention measurable and evolvable.

## Core request flows

### 1) App boot
1. Client checks local auth state.
2. If signed in: fetch `users/{uid}` + `profiles/{uid}` (or single `users/{uid}` doc if unified).
3. If profile incomplete: force Profile Wizard (hard onboarding).

### 2) Create/Update profile
- Client submits a **ProfileDraft** to `functions/profileUpsert`.
- Server:
  - verifies ID token
  - validates fields (length, allowed chars, immutable fields)
  - writes `users/{uid}` and derived fields
  - emits an audit record and optional moderation flags.

### 3) Default chat entry
- Client calls `functions/chatEnsureLobbySession` (or `chatJoinLobby`) to:
  - verify tenure (e.g., 7-day rule)
  - ensure membership in Lobby chat
  - return lobby chatId + ephemeral settings (e.g., message retention policy).
- Client reads lobby messages from Firestore and sends new messages via `functions/sendMessage`.

### 4) “Purple DM” (instant) vs “Red message” (email-like)
- Keep **two separate products** (two collections + UI surfaces):
  - DM/Chat = realtime message stream
  - Mailbox = threads/inbox model, not realtime required
- Server mutations enforce anti-harassment (block checks), reporting hooks.

## Server invariants (must hold)
- `senderUid` always equals verified auth uid.
- `createdAt` uses server timestamp.
- Membership and visibility checks happen server-side.
- Any “admin visibility” uses privileged tools only; clients never get admin data.

## Rate limiting (minimum viable)
Per uid:
- createChat: N/day (configurable)
- sendMessage: burst + sustained limit
- report user/content: M/day
Store counters in Redis-like store if moving to Cloud Run; otherwise use Firestore counters with care.

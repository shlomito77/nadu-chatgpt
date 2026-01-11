# 20 — Security (Technical)

**Last updated:** 2026-01-07  
**Type:** HOW (architecture/security)

## 1. Principles
- **Default deny**: unauthenticated users have no access.
- **Least privilege**: clients read only what they must.
- **Server-authoritative mutations**: create/update operations via Cloud Functions.
- **Auditability**: every moderation action is recorded.

## 2. Auth & identity
- Firebase Auth providers: Email/Password+Phone verification, Google, Apple.
- Enforce 18+ via DOB check during onboarding (server-side validation).
- Immutable fields enforced in server mutation layer.

## 3. Firestore Rules posture
- Client cannot:
  - write messages
  - edit/delete messages
  - tamper with `senderUid`, timestamps, membership
- Clients may read only:
  - objects they are allowed to see (membership / privacy flags)
- Admin tools use Admin SDK (bypass rules) with explicit checks.

## 4. Functions hardening
- Verify Firebase ID token for every call.
- Validate payloads (schema) and sanitize text.
- Rate limits:
  - OTP
  - message sending (chat + DMs)
  - reporting (to prevent spam)
- Idempotency where needed (clientMessageId).
- Structured errors: BAD_REQUEST / UNAUTHENTICATED / PERMISSION_DENIED / INTERNAL.

## 5. Abuse & safety
- Reporting pipeline across content types (users/posts/comments/dms/chat).
- Mutual blocking enforced consistently at:
  - read time (visibility)
  - send time (prevent new interactions)
- Admin visibility:
  - can view anonymous authors
  - can see full report history

## 6. Data protection (cost-aware)
- Minimize stored PII:
  - phone numbers stored as hashes if possible (policy decision)
- Media stored in Cloud Storage with strict rules and signed URLs.


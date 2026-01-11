# Moderation pipeline

## Goals
- Fast user reporting (harassment, scam, impersonation)
- Auditability (who did what and why)
- Minimal admin surface in v1, extensible later

## Reporting UX
- Every DM/chat message, mailbox message, post, comment, and profile has “Report”.
- Report captures:
  - category
  - free-text (required)
  - evidence snapshot (messageId/ref + recent context window)

## Server handling
- `reportCreate` stores `reports/{id}`.
- Optional: auto-triage:
  - repeated reports threshold → temporary mute
  - high severity categories → immediate review queue

## Admin actions
- warn
- mute (chat + DM) time-bounded
- mailbox send block time-bounded
- ban (account)
- content removal (post/comment/message)

## Audit
- every action creates `moderationActions/{id}` with evidence refs.

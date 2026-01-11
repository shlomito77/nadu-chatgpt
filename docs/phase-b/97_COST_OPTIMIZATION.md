# Cost optimization (without quality loss)

## Firestore cost levers
- Prefer **paginated queries** (limit + startAfter).
- Avoid “fanout writes” to many docs on every message.
- Store small, denormalized “chat preview” on chat doc updated server-side.

## Media cost levers
- Compress images client-side (or on finalize trigger).
- Store thumbnails and serve thumbnails in lists.

## Notifications cost levers
- Batch notifications; debounce for high-traffic chats.
- Prefer in-app for lobby; push only for DMs/mailbox.

## Compute levers
- Keep Functions small; move heavy processing (video/blur ML) to Cloud Run when needed.

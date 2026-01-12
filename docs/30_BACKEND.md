# 30_BACKEND — Functions/API Structure
_גרסת GOLD: 2026-01-12_

## עקרון
ה‑Backend הוא “שער כתיבה” — כל write משמעותי עובר דרכו.

## Endpoints (MVP)
- Auth onboarding (claims init) — trigger/onCreate או endpoint ייעודי
- Posts: create/update/delete(soft)
- Comments: create/delete(soft)
- Chat: create DM (אם לא קיים), sendMessage
- Reports: createReport
- Moderation: action endpoints (מוגבל roles)

## ולידציה
- Schema validation (server) לכל payload.
- Rate limiting בסיסי.
- Sanitization ל‑HTML אם נשמר.

## Audit
- כל moderation/admin writes: רישום ל‑moderationActions

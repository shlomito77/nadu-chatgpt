# 40_FRONTEND — Next.js App Structure
_גרסת GOLD: 2026-01-12_

## Pages (MVP)
- `/auth` — login/register
- `/feed` — posts list
- `/posts/[id]` — post + comments
- `/chat` — list
- `/chat/[id]` — dm thread
- `/settings` — privacy basics + account

## UI Rules
- RTL מלא (logical properties)
- טקסט עשיר: sanitize לפני render
- העלאת מדיה: ב‑MVP מינימום/אופציונלי

## Data Fetching
- read ישיר מ‑Firestore לפי rules
- write דרך API (Functions)

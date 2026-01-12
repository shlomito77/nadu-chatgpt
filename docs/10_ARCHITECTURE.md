# 10_ARCHITECTURE — NADU (How)
_גרסת GOLD: 2026-01-12_

## סטאק מומלץ (MVP)
- Frontend: Next.js (App Router)
- Backend: Firebase (Auth + Firestore) + Cloud Functions (HTTP/Callable)
- Storage: Cloud Storage (Phase 2 אם צריך)
- Observability: Logging מינימלי (Phase 1)

## עקרונות מערכת
- Firebase‑first, PAYG.
- Client קורא; שרת כותב (ליבה).
- כל שינוי רגיש נרשם (audit).

## רכיבים
1. **Web App (Next.js)**
   - Auth UI
   - Feed / Post / Comments
   - DM Chat
2. **API Layer (Functions)**
   - createPost, comment, sendMessage, createReport, moderationAction
3. **Firestore**
   - data model לפי /specs/03
4. **Security**
   - App Check
   - Custom claims
   - Rules restrictive

## גבולות אחריות
- UI: הצגה + ולידציה בסיסית בלבד.
- Functions: ולידציה מחייבת, הרשאות, כתיבה, rate limiting.
- Firestore Rules: חומת מגן נוספת (לא לוגיקה עסקית כבדה).

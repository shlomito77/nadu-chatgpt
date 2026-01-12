# 02_SECURITY_PRIVACY — דרישות מחייבות (P0/P1)
_גרסת GOLD: 2026-01-12_

## P0 — חסימה (אין קוד/פרודקשן בלי זה)
1. **Firebase App Check** חובה לפני כל API call (מומלץ Turnstile/Recaptcha לפי פלטפורמה).
2. **Custom Claims** להרשאות (`role`, `banned`, `tenureDays`, וכו').
3. **Default Deny Firestore Rules** + גישה מינימלית.
4. **Secrets** רק ב‑GCP Secret Manager (לא בקוד/ENV מקומי דולף).
5. **Server‑Authoritative Writes**: כתיבות לישויות ליבה דרך Functions/API.
6. **Audit Log** לפעולות מודרציה/אדמין.

## P1 — נדרש לפני סקייל
- Rate limiting ב‑API (per user / per IP).
- Anti‑spam gating (tenure / verification / throttling).
- Logging בסיסי + alerting מינימלי על שגיאות קריטיות.
- Backups/DR בסיסי ל‑Firestore.

## מודל הרשאות (מינימלי)
- `role: user | moderator | admin` ב‑custom claims.
- `banned: true/false` ב‑claims.
- `tenureDays` ב‑claims לצורך gating.

## מדיניות פרטיות תפעולית
- מינימום נתונים ציבוריים בפרופיל.
- אנונימיות היא מצב תצוגה, לא מחיקה של שיוך (authorUid נשמר פנימית).
- מחיקה/Retention לפי `80_DATA_RETENTION_SPEC` (אם קיימת) — ב‑MVP: soft delete.

## Firestore Rules — עקרונות
- לקוח: **read בלבד** למרבית הקולקשנים; write דרך שרת.
- כל match של ליבה מוגבל למשתתפים/בעלים/תפקידים.

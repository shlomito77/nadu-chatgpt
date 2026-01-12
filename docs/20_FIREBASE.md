# 20_FIREBASE — Setup, Rules, Deploy
_גרסת GOLD: 2026-01-12_

## Projects & Environments
- `dev` / `prod` (Phase 1 אפשר פרויקט אחד, אך מומלץ שניים בהקדם)

## Auth
- Providers: Email/Password (+ אימות), אופציונלי Google/Apple
- אין Anonymous Auth
- Custom claims נקבעים בשרת

## App Check
- חובה לאכוף ב‑Functions.
- Web: Turnstile/Recaptcha בהתאם להחלטה.

## Firestore Rules
- Default deny.
- read מוגבל; write ליבה חסום ללקוח.

## Emulators (מומלץ)
- Auth + Firestore emulators לפיתוח.
- Smoke tests ידניים אחרי כל שינוי rules.

## Deploy (MVP)
- deploy rules/indexes לפני functions/web
- סדר מומלץ:
  1) `firestore:rules`
  2) `firestore:indexes`
  3) `functions`
  4) `hosting`

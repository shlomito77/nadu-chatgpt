# Phase C — אסטרטגיית בדיקות

## שכבות בדיקה
1) Unit (לוגיקה טהורה)
2) Integration (Functions + Firestore emulator)
3) E2E (flows: signup → profile → post → chat → report)

## כללי חובה
- כל PR: unit tests
- כל Milestone: integration suite
- לפני Production: E2E + security regression

## מה נבדק במיוחד
- Auth linking + anti-duplicate
- Onboarding gate
- Privacy toggles
- Anonymous posts: users see Anonymous; admin sees uid
- Chat tenure gating
- Reporting flows and audit log

## כלים
- Firebase emulators
- Node test runner (Jest/Vitest)
- Optional: Playwright for E2E (later)

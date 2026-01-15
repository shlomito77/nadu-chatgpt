# 160_MIGRATIONS_VERSIONING

_Last updated: 2026-01-08_

המסמך הזה מתאר את היישום הטכני (HOW) של NADU בהתאם ל־SPECS שהם החוק העליון. כל סטייה מה־SPECS מחייבת עדכון SPECS לפני שינוי יישומי.

## Schema versioning
- כל מסמך מרכזי כולל `schemaVersion`.
- קוד תומך ב־N ו־N-1.

## Backfill jobs
- Cloud Run job שמריץ migration בטוח:
  - batch + rate limiting
  - resume capability
  - logs + audit

## Client versions
- מינימום גרסאות נתמכות.
- Feature flags מאפשרים לפרוס שינוי הדרגתי.

## Firestore indexes
- כל שינוי query → עדכון `firestore.indexes.json` + CI check.

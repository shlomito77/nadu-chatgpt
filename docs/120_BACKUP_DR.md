# 120_BACKUP_DR

_Last updated: 2026-01-08_

המסמך הזה מתאר את היישום הטכני (HOW) של NADU בהתאם ל־SPECS שהם החוק העליון. כל סטייה מה־SPECS מחייבת עדכון SPECS לפני שינוי יישומי.

## גיבויים
- Firestore: scheduled exports (Cloud Storage) יומי/שבועי.
- Storage: bucket versioning (אם אפשר) + lifecycle.
- Secrets: נשמרים ב־Secret Manager.

## שחזור
- תרגול Restore רבעוני בסביבת staging.
- Runbook: איך משחזרים Firestore export, ומה מאבדים.

## RPO/RTO (MVP)
- RPO: עד 24 שעות (גיבוי יומי).
- RTO: כמה שעות (תלוי בגודל).

## תרחישי DR
- מחיקה בשוגג (admin mistake) → restore.
- תקלה בפריסה → rollback.
- תקלה ב־region → multi-region בעתיד (אם budget).


# 100_ADMIN_MOD_TOOLS

_Last updated: 2026-01-08_

המסמך הזה מתאר את היישום הטכני (HOW) של NADU בהתאם ל־SPECS שהם החוק העליון. כל סטייה מה־SPECS מחייבת עדכון SPECS לפני שינוי יישומי.

## מטרות
- ניהול דוחות (Reports) בצורה יעילה.
- כלים לחסימה/השבתה/הסרת תוכן.
- שקיפות (Audit) ומניעת abuse של מנהלים.

## Roles
- `admin`: גישה מלאה.
- `moderator`: ניהול דוחות ותוכן, ללא שינוי תשתיתי.

## מודול Reports Console
- רשימת דוחות עם פילטרים:
  - סוג: harassment/spam/impersonation/illegal/etc
  - סטטוס: open/in_review/resolved/rejected
  - יעד: user/post/comment/message
- פתיחת דוח:
  - סיכום, היסטוריה, ראיות (IDs), תצוגה מקדימה (sanitized)
- פעולות:
  - Warn user (template)
  - Temporary mute (chat)
  - Temporary suspension
  - Ban (hard)
  - Remove content (soft delete + tombstone)
  - Escalate to admin

## מודול Users Console
- חיפוש לפי uid/username.
- פרטי וותק, סטטוס, מספר דוחות, חסימות.
- פעולות:
  - Force logout (invalidate sessions)
  - Set flags (shadowban, reviewRequired)
  - Reset username (admin only)

## Audit & Safety
- כל פעולה מנהלית יוצרת `auditEvents` עם:
  - adminUid, action, target, reason, ts
- Dual control לאירועים חמורים (אופציונלי): ban קבוע דורש 2 admins.

## Data Access
- Admin UI קורא דרך API מאובטח (Cloud Run) ולא ישירות Firestore.

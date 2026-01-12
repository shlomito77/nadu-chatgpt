# 01_PRODUCT_RULES — חוקים מחייבים (SSOT)
_גרסת GOLD: 2026-01-12_

## עקרונות על
- **Default Deny**: ללא משתמש מאומת → אין גישה.
- **Server‑Authoritative**: לקוח לא כותב ישירות ל‑Firestore עבור ישויות ליבה (פוסטים/תגובות/הודעות/דוחות).
- **Least Privilege**: מינימום הרשאות תמיד.
- **Auditability**: כל פעולה רגישה נרשמת.

## זהות משתמש
- אין Anonymous Auth למשתמשים.
- גיל מינימום 18+.
- שדות נעולים: `uid`, `createdAt`, `dob`, (והגדרות נוספות אם הוחלט).
- שינוי `username`: לכל היותר פעם ב‑30 יום (אם בשימוש).

## פוסטים
- פוסט יכול להיות אנונימי: `isAnonymous=true` אך עדיין נשמר `authorUid` פנימי.
- נראות פוסט: `public | members | restricted` (ב‑MVP: public/members מספיק).
- מחיקה: soft delete ברירת מחדל (למודרציה/אודיט).

## תגובות
- קשורות לפוסט (subcollection).
- אפשרות חסימה בין משתמשים מונעת אינטראקציה דו־צדדית.

## צ'אט 1:1
- צ'אט קיים רק בין משתתפים, קריאה/כתיבה כפופות לחברות בצ'אט.
- גייטינג כנגד ספאם: ותק מינימלי/הגבלות קצב.
- delete message: soft delete / tombstone.

## דיווח ומודרציה
- כל דיווח יוצר מסמך `reports/{reportId}` עם snapshot של התוכן.
- כל פעולה אדמינית/מודרציה יוצרת `moderationActions/{actionId}`.

## כללי UI/UX מחייבים
- RTL תקין: שימוש ב‑CSS logical properties (inline‑start/end) ולא left/right.
- פרטיות ברירת מחדל: מינימום מידע ציבורי.

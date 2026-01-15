# 130_COMPLIANCE_TRUST

_Last updated: 2026-01-08_

המסמך הזה מתאר את היישום הטכני (HOW) של NADU בהתאם ל־SPECS שהם החוק העליון. כל סטייה מה־SPECS מחייבת עדכון SPECS לפני שינוי יישומי.

## עקרונות Trust & Safety
- גיל 18+ בלבד (policy + UX + enforcement).
- Privacy by default.
- שקיפות: למה נאסף כל שדה.

## גיל/18+
- הצהרה + בדיקת גיל (DOB) בזמן onboarding.
- אי אפשר לשנות DOB/מין לאחר מכן (למניעת טרולים) — כפי שהוגדר.
- חריג: שינוי רק דרך support/admin + audit.

## נתונים רגישים
- מינימום איסוף.
- הצפנה במעבר (TLS) כברירת מחדל.
- הפרדה בין PII (טלפון/אימייל) ל־profile public.

## בקשות משתמש
- Export data (בהמשך).
- Delete account: soft delete + retention תפעולי.

## מדיניות תוכן
- דיווח/מודרציה (ספק 70) + אכיפה עקבית.

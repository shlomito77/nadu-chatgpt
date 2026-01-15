# 110_TESTING_QA

_Last updated: 2026-01-08_

המסמך הזה מתאר את היישום הטכני (HOW) של NADU בהתאם ל־SPECS שהם החוק העליון. כל סטייה מה־SPECS מחייבת עדכון SPECS לפני שינוי יישומי.

## שכבות בדיקה
1. **Rules tests** (Firestore Security Rules)
- בדיקות יחידה ל־read/write paths קריטיים.
- תרחישים: member/non-member, admin, anonymous.

2. **Functions tests**
- createChat: תקין/כשל, חברים, dm/group.
- sendMessage: חבר/לא חבר, rate limit, size.

3. **Integration (Emulator)**
- seed scripts יוצרים משתמשים/צ׳אטים/הודעות.
- אימות UI minimal: קריאה וכתיבה דרך API.

4. **E2E (בהמשך)**
- Playwright/Cypress על web (אם יש web); במובייל: Detox.

## נתוני בדיקה
- `seed-auth.ps1`, `seed-chat.ps1` סטנדרטיים.
- תיעוד שימוש ב־Emulator UI לבדיקות ידניות.

## Definition of Done
- כל endpoint עם בדיקות בסיס.
- אין “500 INTERNAL” ללא לוג+message ברור.
- Regression list לפני deploy.

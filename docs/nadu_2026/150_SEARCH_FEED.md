# 150_SEARCH_FEED

_Last updated: 2026-01-08_

המסמך הזה מתאר את היישום הטכני (HOW) של NADU בהתאם ל־SPECS שהם החוק העליון. כל סטייה מה־SPECS מחייבת עדכון SPECS לפני שינוי יישומי.

## Feed (פוסטים)
- Query לפי `createdAt desc` + pagination.
- Filters: tags, groupId, visibility.
- Anti-abuse: rate limit על יצירת פוסטים/תגובות.

## חיפוש משתמשים
- חיפוש לפי username (prefix search).
- Firestore מוגבל ב־contains; פתרון MVP:
  - `usernameLower` + range query (startAt/endAt).
- בהמשך: Algolia/Meilisearch.

## חיפוש פוסטים
- MVP: tags + title prefix.
- בהמשך: full-text.

## Privacy
- משתמשים חסומים לא יופיעו בחיפוש.
- anonymous posts לא מקושרים ל־author בתצוגה, אך נשמרים ל־admin.

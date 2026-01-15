# 90_COST_OPTIMIZATION

_Last updated: 2026-01-08_

המסמך הזה מתאר את היישום הטכני (HOW) של NADU בהתאם ל־SPECS שהם החוק העליון. כל סטייה מה־SPECS מחייבת עדכון SPECS לפני שינוי יישומי.

## עקרונות חסכון בלי לפגוע באיכות
1. **הקטנת Reads**: זה בדרך כלל המרכיב היקר ביותר ב־Firestore.
2. **כתיבה יעילה**: לא לכתוב שדות שמתחלפים כל שנייה (למשל presence) באותו מסמך של צ'אט.
3. **דאטה מדורג**: חם (Hot) מול קר (Cold): לשמור הודעות ישנות בארכיון/אחסון זול אם צריך.
4. **מדיה**: תמונות/וידאו תמיד ב־Cloud Storage + CDN, לא ב־Firestore.
5. **Pagination תמיד**: אין "טען הכל" (messages/posts).
6. **אינדקסים מינימליים**: רק מה שצריך. אינדקס לא נחוץ = כסף.

## צ׳ט: נקודות חיסכון
- messages:
  - שאילתות לפי `createdAt` עם `limit` (למשל 30–50).
  - Cache local.
- presence:
  - לשמור ב־Realtime Database/Redis-like (אם נדרש), או Firestore עם TTL קצר ובכתיבה מוגבלת.
- notifications:
  - לא לעשות Fanout לכולם ל־lobby; להסתפק ב־"new message badge" וקריאה לפי דרישה.

## מדיניות TTL/Retention (תיאום עם SPECS)
- צ׳ט לובי: יכול להיות TTL קצר (אם SPECS קובעים "נמחק ביציאה", נשמור בממילא transient).
- הודעות סגולות/אדומות: נשמרות (כפי שהוגדר).
- logs/audit: retention מוגבל (למשל 90/180 יום) בהתאם לצרכים.

## Storage של תמונות פרופיל/פוסטים
- Resize בשרת (Cloud Run) ל־3 גדלים: thumb / normal / large.
- WebP/AVIF.
- הגבלת משקל (2–5MB) + דחיסה.

## כללי UI שחוסכים כסף
- Feed עם infinite scroll + prefetch מתון.
- להימנע מ־"live listeners" בכל מקום; רק במסכים שנמצאים בפוקוס.
- Debounce לכל חיפוש/סינון.

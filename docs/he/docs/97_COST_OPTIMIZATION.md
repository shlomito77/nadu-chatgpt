# חיסכון עלויות בלי פגיעה באיכות

## Firestore
- תמיד פג'ינציה (limit + startAfter).
- להימנע מ־fanout writes לכל המשתתפים בכל הודעה.
- לשמור “preview” קטן בצ'אט שמתעדכן שרתית.

## מדיה
- דחיסה (client או finalize).
- thumbnails לליסטים.

## התראות
- debounce בלובי/חדרים עמוסים.
- Push בעיקר ל־DM/אדומות; בלובי עדיף in-app.

## Compute
- Functions קטנות; עיבוד כבד ל־Cloud Run בעת הצורך.

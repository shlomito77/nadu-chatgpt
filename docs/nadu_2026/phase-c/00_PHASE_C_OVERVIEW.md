# Phase C — תוכנית יישום (Implementation Planning)

תאריך: 2026-01-08

## מטרה
Phase C מתרגם את ה־SPECS (WHAT/WHY) וה־DOCS הטכניים (HOW) לתוכנית ביצוע מלאה: אפיקים (Epics), ספרינטים, משימות, בדיקות, CI/CD, ומסלול עלייה לפרודקשן.

**חוק עליון:** כל שינוי לוגיקה/מוצר מתועד ב־/docs/specs.
**יישום:** מתועד ב־/docs/docs ומיושם בקוד.

## תוצרים ב־Phase C
- מפת דרכים (Roadmap) לפי Epics + Milestones
- תכנון ספרינטים (Sprint Plan) עם Definition of Done
- Backlog התחלתי (משימות מוכנות)
- אסטרטגיית בדיקות (Unit/Integration/E2E) + אמולטורים
- תכנון CI/CD, סביבות, תהליך ריליס
- תוכנית Rollout לפרודקשן + ניטור + Incident Runbook קצר
- Risk Register (סיכונים והפחתה)

## הנחות/החלטות שכבר ננעלו (קצר)
- Firebase-first (Auth + Firestore + Functions) בהתאם למסמכי Phase B
- צ'אט/הודעות דרך Functions (mutations בשרת), לקוח בעיקר קריאה
- אנונימיות רק לפוסטים/תגובות (Anonymous למשתמשים; מלאה לאדמין)
- מגבלות שינויים בפרופיל: מין + תאריך לידה/גיל לא ניתנים לשינוי
- שינוי Username: פעם ב־30 יום
- אפליקציה Mobile-first; Web optional (לא חובה בשלב ראשון)

## איך להשתמש
1. קרא 10_ROADMAP ו־20_EPICS כדי להבין סדר בנייה.
2. קרא 30_SPRINT_PLAN כדי להתחיל ביצוע בספרינט 1.
3. השתמש ב־40_BACKLOG כ־source of truth למשימות.
4. בדיקות/CI ב־50_TEST_STRATEGY ו־60_CI_CD_EXECUTION.

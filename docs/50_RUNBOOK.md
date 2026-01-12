# 50_RUNBOOK — איך מרימים מהר (והכי פחות תקלות)
_גרסת GOLD: 2026-01-12_

## סדר הקמה מומלץ (Day 1–2)
1. Firebase Project + Auth providers
2. Firestore rules בסיסיים (default deny + read מוגבל)
3. Next.js skeleton + Auth flow
4. Feed read (posts)
5. Functions: createPost
6. Comments
7. DM: create chat + send message
8. Reports + basic moderation UI (admin only)
9. Deploy + Smoke tests

## Smoke Tests (אחרי כל Deploy)
- הרשמה/התחברות
- צפייה בפיד
- יצירת פוסט
- הוספת תגובה
- פתיחת DM ושליחת הודעה
- יצירת Report
- בדיקת חסימה: משתמש לא מאומת לא רואה כלום

## תקלות נפוצות
- App Check חוסם Calls → לבדוק enforcement/keys.
- Rules חוסמות reads → לבדוק match + token claims.
- RTL שבור → להשתמש ב‑logical properties.

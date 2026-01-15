# 140_MEDIA_PIPELINE

_Last updated: 2026-01-08_

המסמך הזה מתאר את היישום הטכני (HOW) של NADU בהתאם ל־SPECS שהם החוק העליון. כל סטייה מה־SPECS מחייבת עדכון SPECS לפני שינוי יישומי.

## מטרות
- העלאת תמונות פרופיל/פוסטים בצורה מאובטחת וזולה.
- Resize/Compression אוטומטי.
- מניעת חשיפת מקור/EXIF.

## Flow מומלץ
1. Client מבקש `uploadUrl` (Signed URL) מהשרת.
2. Client מעלה ל־Cloud Storage לנתיב פרטי.
3. Trigger (Cloud Functions/Run) מבצע:
   - strip EXIF
   - resize ל־thumb/normal/large
   - content moderation (אופציונלי)
4. Firestore מתעדכן עם URLs של הווריאציות.

## אבטחה
- Storage rules: רק owner יכול להעלות לתיקייה שלו.
- Signed URL עם TTL קצר.
- הגבלת mime types.

## פרטי UX
- progress bar
- error messages
- retry

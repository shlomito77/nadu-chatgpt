# Functions ושירותים

## עקרונות
- **כל הכתיבות דרך Functions** (למעט חריגים שמאושרים ב־Spec).
- כל Function מבצעת:
  - אימות זהות
  - בדיקת חסימות
  - בדיקת חברות/נראות
  - ולידציית קלט
  - Rate limits
  - hooks לדיווח/מודרציה

## סט Functions מינימלי
### Auth/פרופיל
- `profileUpsert`
- `usernameChange` (קול־דאון 30 יום)
- `privacyUpdate`

### צ'אט
- `createChat` (dm/room)
- `joinChat` / `leaveChat`
- `sendMessage`
- `chatEnsureLobbySession` (גייט לפי ותק)

### פוסטים
- `createPost` (כולל אנונימי)
- `commentCreate`
- `reactionSet`

### הודעות אדומות
- `threadCreate`
- `threadSendMessage`
- `threadMarkRead`

### דיווח/מודרציה
- `reportCreate`
- `moderationActionApply` (Admin בלבד)

## חוזה שגיאות
- `{ ok: true, data: ... }`
- `{ ok: false, error: "...", message?: "...", details?: ... }`

## אמולציה
- `firebase emulators:start`
- סקריפטי seed ליצירת משתמשים, צ'אט, הודעות.

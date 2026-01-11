# 10_ARCHITECTURE (HE)

## 0. מטרה
לתאר את ארכיטקטורת NADU ברמה תפעולית (HOW), בהתאם ל־SPECS:
- שכבות מערכת
- עקרונות אבטחה
- תהליכי “Mutations” דרך Functions
- חיסכון בעלויות למדיה

---

## 1. שכבות (High Level)
### 1.1 Client (Mobile-first)
- אפליקציה/ווב־מובייל שצורכת API + Firestore לקריאה.
- אין כתיבות מסוכנות ישירות ל־Firestore עבור פעולות רגישות.

### 1.2 Firebase Auth
- התחברות/הרשמה (Password+Phone, Google, Apple).
- Gate מלא: בלי Auth אין גישה.

### 1.3 Firestore
- מקור אמת לנתונים (Profiles, Posts, Chat metadata, etc.)
- Rules קשוחים: קריאות לפי הרשאות, כתיבות מוגבלות.

### 1.4 Cloud Functions (Mutation API)
- כל פעולות כתיבה קריטיות עוברות דרך Functions:
  - createChat, sendMessage
  - reporting
  - moderation actions
  - image processing triggers (בהמשך)
- Functions מאמתות ID token ומבצעות בדיקות membership/visibility.

### 1.5 Cloud Storage (Media)
- אחסון תמונות (Avatar, תמונות פוסטים).
- Policy: Resize+Compress אוטומטי, גרסה אחת בלבד.

---

## 2. עיקרון ליבה: Functions-only for mutations
למה?
- Rules לבד לא מספיקות לאכוף אינוואריאנטים מורכבים.
- מניעת abuse (rate limit, spam, forged fields).
- אחידות לוגיקה (same checks everywhere).

---

## 3. Cost Optimization: Media
- Avatar: WEBP 512×512, overwrite.
- Posts: (יוגדר ב־Posts docs) – אותו עיקרון: גרסה אחת, פורמט אחיד.

---

## 4. Environments
- Emulator Suite ל־local dev:
  - auth, firestore, functions, ui
- CI:
  - lint/build functions
  - optional rules compilation check

---

## 5. Next technical docs to align
- 30_DATA_MODEL.md: collections + indexes
- 40_API_CONTRACTS.md: request/response schemas
- 50_CHAT_TECHNICAL.md: chat lifecycle + retention (tell)

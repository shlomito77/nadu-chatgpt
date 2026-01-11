# מימוש סכימת Firestore

> מפה קונקרטית שמתיישבת עם ה־Rules והגישה של Functions. מסמך חי.

## קולקשנים
### users/{uid}
- זהות + roles + ותק
- **לא ניתן לשינוי**: מין, תאריך לידה/גיל
- **חצי־נעול**: username (שינוי כל 30 יום)
- שדות: username, displayName, sex, role, createdAt, updatedAt, roles, flags

### profiles/{uid} (אופציונלי)
- ביו (<=1000) + העדפות + פרטיות + הפניות למדיה

### posts/{postId}
- authorUid, visibility, createdAt, content, mediaRefs, isAnonymous
- אנונימי: לציבור “Anonymous”, למנהל עדיין נשמר authorUid

תתי־קולקשנים:
- posts/{postId}/comments/{commentId}
- posts/{postId}/reactions/{uid}

### groups/{groupId}
- מטאדאטה + visibility + createdBy
תתי־קולקשנים:
- groups/{groupId}/members/{uid}

### chats/{chatId}
- type: lobby | room | dm
- createdBy
- title (לחדר)
- retentionPolicy: persistent | ephemeral (לפי Spec)
תתי־קולקשנים:
- chats/{chatId}/members/{uid}
- chats/{chatId}/messages/{messageId}

### mailboxThreads/{threadId}  (אדומות)
- participants [uid]
- lastMessageAt, subject?
תתי־קולקשנים:
- mailboxThreads/{threadId}/messages/{messageId}

### reports/{reportId}
- reporterUid
- targetType + targetRef
- category + description
- status
- createdAt

### moderationActions/{actionId}
- actorUid
- actionType
- targetUid/targetRef
- reason
- createdAt
- evidenceRefs

## אינדקסים
מתחילים מינימום:
- פיד פוסטים לפי createdAt + visibility
- הודעות צ'אט לפי createdAt
- threads לפי lastMessageAt
מוסיפים רק לפי צורך אמיתי.

## שמירת נתונים
- לובי/חדרים: נשמרים אלא אם Spec אומר ephemeral.
- אם ephemeral: ניקוי מתוזמן (Scheduler + Function) או שדה expiresAt וניקוי באצוות.

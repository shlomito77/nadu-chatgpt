# 30 — מודל נתונים (טכני)

**עודכן לאחרונה:** 2026-01-07  
**סוג:** HOW (מבני דאטה ואוספים)

## 1) אוספים מרכזיים
### users/{uid}
- username, role, gender, dob, createdAt
- שדות פרופיל (bio, העדפות, באדג'ים בהמשך)
- הגדרות פרטיות
- ותק (נגזר) או מחושב בלקוח

### posts/{postId}
- authorUid (מוסתר לציבור בפוסט אנונימי)
- isAnonymous
- body, mediaRefs, createdAt
- מונים: likeCount, commentCount

### posts/{postId}/comments/{commentId}
- authorUid, isAnonymous
- parentCommentId (לשרשור תגובות)
- body, createdAt

### chats{chatId}
- type: lobby | room
- createdByUid
- members (לחדרים) / “כולם” ללובי
- createdAt
- ephemeralPolicy: true

### chats/{chatId}/messages/{messageId}
- senderUid, body, createdAt
- replyToMessageId (אופציונלי)
- deletedAt (אופציונלי)
- הערה: ניתן לשאול מאז sessionStart; ניקוי אופציונלי.

### dmThreads/{threadId}
- type: purple | red
- participants: [uidA, uidB]
- createdAt, lastMessageAt

### dmThreads/{threadId}/messages/{messageId}
- senderUid, body, createdAt
- readBy (uid->timestamp) לסגולות
- סטטוסים לאדומות

### reports/{reportId}
- reporterUid
- targetType: user|post|comment|dm|chatMessage
- targetRef
- reason, text, createdAt
- status, moderatorUid, resolvedAt, outcome

### blocks/{blockId}
- blockerUid, blockedUid
- createdAt
- mutual=true

## 2) אינדקסים
- פיד: posts לפי createdAt יורד
- תגובות: createdAt עולה
- DM: participants array-contains uid
- דיווחים: status לתור מודרציה

## 3) מזהים וסדר
- Auto-ID.
- serverTimestamp.
- clientMessageId לאידמפוטנטיות (אופציונלי).


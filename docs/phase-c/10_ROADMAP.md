# Phase C — Roadmap (מפת דרכים)

## עקרונות סדר ביצוע
1) Identity → 2) Profile → 3) Posts → 4) Chat/DM → 5) Moderation/Reporting → 6) Groups → 7) Hardening/Scale → 8) Production

הסיבה: אתר קהילה מבוסס “יוזר=פרופיל”; בלי זה אין הרשאות, פרטיות, או מנגנוני דיווח.

## Milestones מוצעים
### M0 — Repo & Environments (1–2 ימים)
- אחידות תיקיות /docs/specs /docs/docs /docs/he /docs/en
- אמולטורים עובדים (auth/firestore/functions)
- CI בסיסי: lint+build+tests

### M1 — Auth + Onboarding (ספרינט 1)
- Signup/Login: Email+Phone, Google, Apple (בהתאם ל־SPEC)
- זרימת Onboarding קשיחה: ללא פרופיל אין גישה לאתר
- RBAC בסיסי: admin flags בלבד (לצרכי מודרציה עתידית)

### M2 — Profile v1 (ספרינט 2)
- Create Profile + Edit Profile + Privacy settings
- Username rules + change window 30 ימים
- Locked fields: sex + DOB
- Role display לפי מין/הטיה (זכר/נקבה/אחר)

### M3 — Posts v1 (ספרינט 3)
- Create/Edit/Delete policy לפי SPEC (כולל אנונימי)
- Comments + threaded replies
- Reactions
- Basic feed

### M4 — Chat Lobby + Rooms + DM (ספרינט 4)
- לובי דיפולט (Public)
- Rooms
- DM: “סגולות” (מיידיות) + “אדומות” (דוא״ל)
- וותק לצ’אט (7 ימים) + מסכי הסבר

### M5 — Reporting & Moderation v1 (ספרינט 5)
- Report user/content, queues לאדמין
- Soft actions: warn/mute/timeout/ban
- Audit log

### M6 — Groups v1 (ספרינט 6)
- Create/join/leave
- Visibility (public/members/private)
- Content scoping groups

### M7 — Hardening & Scale (ספרינט 7)
- Rate limits
- Index tuning
- Backups/export
- Observability

### M8 — Production (ספרינט 8)
- Domain/App hosting
- Security review
- Launch checklist

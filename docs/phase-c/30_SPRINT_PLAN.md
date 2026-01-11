# Phase C — Sprint Plan (תכנון ספרינטים)

## קצב מוצע
ספרינט = 1 שבוע (או 2 אם צוות קטן).  
כל ספרינט מסתיים ב־Demo + Retro + החלטות נעולות.

## Definition of Done (DoD)
- ✅ קוד: lint/build pass
- ✅ בדיקות: unit + integration רלוונטיות
- ✅ Docs: עדכון /docs/docs אם השתנה HOW
- ✅ Specs: אם השתנה WHAT/WHY — עדכון /docs/specs (ואז התאמת קוד)
- ✅ Security: rules/permissions נבדקו באמולטור
- ✅ PR: review + merge to dev (main רק יציב)

## Sprint 1 — Auth/Onboarding
- Setup auth emulator flows
- Signup/Login: Email/Pass + Phone verify
- Google + Apple provider hooks
- Onboarding gate
- Minimal UI screens: login/register/onboarding/profile required

## Sprint 2 — Profile v1
- Profile create + edit
- Privacy settings
- Username change rules
- Role + gender localization

## Sprint 3 — Posts v1
- Create/read/comment/reactions
- Anonymous mode
- Feed v1

## Sprint 4 — Chat/DM v1
- Lobby + rooms
- DM types
- Tenure gating
- Reporting hooks (placeholder)

## Sprint 5 — Reporting/Moderation v1
- Full report flows
- Admin queue
- Basic actions

ספרינטים 6–8: Groups, notifications, hardening, production.

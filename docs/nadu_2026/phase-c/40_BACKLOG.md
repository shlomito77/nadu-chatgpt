# Phase C — Backlog התחלתי (מוכן לביצוע)

> פורמט: [Epic] (Priority) — Task — Output

## (P0) Foundations
- [Platform] P0 — CI pipeline lint/build/test — GitHub Actions working
- [Platform] P0 — Emulator scripts (auth/firestore/functions) — one command start
- [Platform] P0 — Env config template — .env.example + secrets doc

## (P0) Auth/Onboarding
- [Auth] P0 — Email/Password signup+login — working end-to-end
- [Auth] P0 — Phone verification — working (provider + UI)
- [Auth] P0 — Google sign-in — working
- [Auth] P0 — Apple sign-in — working (iOS requirement)
- [Onboarding] P0 — Gate: no profile => redirect to create profile — enforced

## (P0) Profile
- [Profile] P0 — Create profile (required fields) — stored in Firestore
- [Profile] P0 — Edit profile (allowed fields) — updates + audit
- [Profile] P0 — Username validation (Heb/Eng/Digits) — enforced
- [Profile] P0 — Username change cooldown 30 days — enforced
- [Profile] P0 — Locked fields: sex + DOB — enforced
- [Profile] P0 — Role labels localized by sex — UX

## (P1) Posts
- [Posts] P1 — Create post (normal + anonymous) — server-side create
- [Posts] P1 — Comments + threaded replies — data model + UI
- [Posts] P1 — Reactions — per-user doc

## (P1) Chat/DM
- [Chat] P1 — Default lobby — read/write (members)
- [Chat] P1 — Rooms create/join — limited
- [DM] P1 — “סגולות” instant — realtime
- [DM] P1 — “אדומות” mailbox — async-like

## (P1) Reporting
- [Reporting] P1 — Report from DM/post/comment — creates report doc
- [Moderation] P1 — Admin queue UI — list/resolve actions

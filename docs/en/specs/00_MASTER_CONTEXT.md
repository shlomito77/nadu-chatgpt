# NADU — Master Context (Product & System)

**Status:** Draft (locked once approved)  
**Last updated:** 2026-01-07  
**Scope:** This file is the single source of truth for *global* constraints across NADU.

## 1. Vision
NADU is a **registered-members-only** social platform for the Israeli BDSM community (18+), focused on:
- **Posts** (feed-style)
- **Chat** (lobby + rooms)
- **Direct Messages**:  
  - **Purple** = “instant” (WhatsApp-like)  
  - **Red** = “mailbox” (email-like)

No content is publicly visible to non-registered users.

## 2. Non‑negotiables
### 2.1 Access control
- Anonymous visitors: **blocked from the entire app** (no read access).
- Only **registered users with a profile** can access app areas.
- Chat access may require **seniority (tenure)** (e.g., 7 days) — configured as a rule.

### 2.2 Identity model
- Users are identified by **username** (not real name).
- Username allowed characters: **Hebrew / English / digits only**.
- Username appears everywhere (posts, chat, DMs) except **anonymous posts/comments** where it appears as `Anonymous`.
- Username change: **max once every 30 days**.
- Immutable fields (anti‑troll): **sex/gender**, **date of birth** (age).

### 2.3 Anonymity (strict scope)
- Anonymity exists **ONLY** for:
  - Creating a post
  - Commenting on a post
- No anonymity in chat or DMs.

### 2.4 Retention
- **Purple DMs**: retained (not ephemeral).
- **Red DMs**: retained.
- **Chat lobby + rooms**: messages are **ephemeral** (cleared for the user after leaving chat / session reset).

### 2.5 Safety & moderation
- Mutual blocking (both sides cannot interact/see each other where applicable).
- Reporting is mandatory across:
  - Users
  - Posts/comments
  - DMs (purple/red)
  - Chat messages (lobby/rooms)
- Admin visibility: full access including anonymous content (for abuse handling).

## 3. Documentation rules (project milestone)
We maintain strict separation:

- **/docs/specs/** = **WHAT / WHY** (product rules & requirements)
- **/docs/docs/** = **HOW** (architecture, data model, APIs, operations)

Hebrew/English are mirrored under:
- **/docs/he/**
- **/docs/en/**

## 4. Technical baseline (current direction)
- Platform: Firebase (Auth + Firestore + Cloud Functions) with emulators for dev.
- Client is mostly read-only; **mutations via Cloud Functions** to enforce invariants.
- Firestore rules remain strict (“no client edits/deletes” posture), server writes via Admin SDK.

## 5. Glossary
- **User/Profile**: same entity (a registered account with a filled profile).
- **Purple DM**: instant messaging channel (WhatsApp-like).
- **Red DM**: mailbox messaging channel (email-like).
- **Chat**: real-time public lobby + user-created rooms; messages ephemeral.


# 10_ARCHITECTURE (EN)

## 0. Goal
Operational architecture (HOW) aligned with SPECS:
- system layers
- security posture
- Functions-first mutation model
- media cost optimization

---

## 1. Layers (High level)
### 1.1 Client (Mobile-first)
- Mobile-first app/web consuming APIs + Firestore reads.
- Avoid direct client writes for sensitive mutations.

### 1.2 Firebase Auth
- Signup/login (Password+Phone, Google, Apple).
- Full auth wall: no auth → no access.

### 1.3 Firestore
- Source of truth for data (profiles, posts, chat metadata).
- Strict rules: reads gated, writes limited.

### 1.4 Cloud Functions (Mutation API)
- Critical writes go through Functions:
  - createChat, sendMessage
  - reporting
  - moderation
  - future media processing triggers
- Functions verify ID tokens and enforce membership/visibility.

### 1.5 Cloud Storage (Media)
- Store avatars and post media.
- Policy: server-side resize+compress, single canonical version.

---

## 2. Core principle: Functions-only for mutations
- Rules alone cannot enforce complex invariants.
- Prevent abuse (rate limits/spam/forged fields).
- Centralize business logic.

---

## 3. Cost optimization: Media
- Avatar: WEBP 512×512, overwrite.
- Posts: same approach (single canonical image).

---

## 4. Environments
- Emulator Suite for local dev:
  - auth, firestore, functions, ui
- CI:
  - lint/build functions
  - optional rules compilation

---

## 5. Next docs to align
- 30_DATA_MODEL.md (collections/indexes)
- 40_API_CONTRACTS.md (schemas)
- 50_CHAT_TECHNICAL.md (chat lifecycle + retention tell)

# 10 — Onboarding & Login Spec

**Last updated:** 2026-01-07  
**Owner:** Product  
**Type:** WHAT/WHY (rules & UX flows)

## 1. Goal
Enable safe, low-friction onboarding while preventing trolls/abuse.

## 2. Entry rules
- App is **closed** to non-registered users (no browsing).
- Minimum age: **18+** (hard requirement).
- After signup, the user **must complete profile creation** to enter the app.

## 3. Supported signup methods (v1)
A) **Username + Password** + **Phone verification** (OTP)
- Phone number is used for verification and anti-abuse.
- Username rules:
  - Hebrew/English/digits only
  - Unique (case-insensitive)
  - Change allowed once per 30 days

B) **Google Sign‑In**

C) **Apple Sign‑In**

## 4. Immutable fields
To reduce trolling and identity churn:
- **Sex/Gender**: immutable after initial profile creation
- **Date of birth**: immutable after initial profile creation

## 5. UX flow (recommended)
### 5.1 First time
1) Welcome → “Create account / Log in”
2) Choose method (A/B/C)
3) Method-specific steps:
   - A: set username + password → verify phone OTP
   - B/C: OAuth → pick username (if not provided) → verify phone OTP (optional, policy decision)
4) Create profile (mandatory) → home

### 5.2 Existing user login
- Same methods (A/B/C)
- If profile missing/incomplete → force profile completion.

## 6. Security & abuse controls (product-level)
- Rate-limit OTP requests (per phone + per IP/device).
- Device/session risk checks (basic in v1).
- Account lockout for repeated failed logins (A).
- No “guest mode”.

## 7. Acceptance criteria
- A user can register via A/B/C and lands in profile creation.
- No app content is accessible without being logged in.
- Username constraints enforced and 30‑day change window enforced.
- Immutable fields cannot be modified.


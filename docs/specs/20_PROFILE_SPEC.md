# 20_PROFILE_SPEC (EN)

## 0. Purpose
This SPEC defines the **product rules and logic** for the NADU user profile:
- Mandatory profile creation after signup
- Ongoing profile editing
- System identity rules (Username)
- Roles and gendered language display
- Profile privacy expectations (what is visible to whom)
- Avatar policy focused on **cost optimization without UX/quality loss**

> This is a WHAT/WHY document. Technical implementation belongs in /docs.

---

## 1. Glossary
- **User**: a registered account.
- **Profile**: the user profile data object.
- **Username**: globally unique handle shown everywhere.
- **Role**: kink/social role (e.g., Dominant/Submissive).
- **Seniority**: number of days since registrationDate.
- **Avatar**: profile picture.
- **Anonymous**: displayed only for anonymous posts/comments.

---

## 2. Flow: Mandatory Profile Creation
### 2.1 When?
- After a successful signup (any provider), the user **must** create a profile to access the full platform.
- Until completed: only onboarding/setup screens are available.

### 2.2 Minimum required fields
1) Username  
2) Gender  
3) DOB / age gate  
4) Role  
5) Avatar (image)  
6) Terms + 18+ + privacy consent

---

## 3. Username (System Identity)
### 3.1 Rules
- Allowed characters: **Hebrew / English / digits only**.
- Must be globally unique.
- Recommended length: 3–20.
- English usernames should be case-insensitive (Alex == alex) to reduce impersonation.

### 3.2 Username change policy
- Allowed **once per 30 days** (cooldown).
- UI must show next available change date.
- Keep an internal audit log (admin only).

### 3.3 Display rules
Username + Role are shown everywhere:
- posts, comments
- chat lobby/rooms
- inbox (red) messages
- instant (purple) messages
- profile pages

Exception:
- Anonymous posts/comments display **Anonymous** (while admin can still see the real author).

---

## 4. Gender + Anti-troll locks
### 4.1 Values (current)
- Male
- Female
- Transgender
- Other / Prefer not to say (optional; if enabled, avoid free-text)

### 4.2 Locked fields (cannot be changed)
To reduce trolling/impersonation:
- Gender is **immutable** after profile creation.
- DOB/Age is **immutable** after profile creation.

---

## 5. Roles and gendered display
### 5.1 Display principle
- Roles list must be displayed in language form based on Gender:
  - Male → masculine labels
  - Female → feminine labels
  - Trans/Other → choose preferred label style (recommended UX) or neutral.

### 5.2 Initial role set (v1)
Start with a clean, mainstream set:
- Dominant
- Submissive
- Switch
- Top
- Bottom

(We can expand later: Sadist/Masochist, DDLG, etc.)

---

## 6. Bio / About
- Limit: **1000 characters**
- Basic filtering: block phone/email/links if needed to reduce harassment.
- Optional, but encouraged.

---

## 7. Seniority
- Calculated from registrationDate.
- Displayed as “Seniority: X days”.
- Used for gating chat entry (e.g., 7 days) and future badges.

---

## 8. Avatar Policy (Cost-optimized, no UX loss)
### 8.1 Locked product decision
- Store **one avatar version only** (no history, no multiple thumbnails).
- Target format: **WEBP**
- Target size: **512×512**
- Target weight: ~150KB (guideline)
- On upload: server-side resize+compress and overwrite previous.

### 8.2 Why it doesn’t hurt quality
- 512×512 is high-quality on mobile UIs.
- WEBP preserves quality at lower size.
- Strong caching reduces bandwidth.

---

## 9. Profile privacy (visibility)
- The entire platform is behind a registration wall: non-registered users see nothing.
- Profile visibility rules for fine-grained settings live in 30_PRIVACY_SECURITY_SPEC.

---

## 10. Admin visibility
Admin has full visibility, including resolving anonymous content to real authorId.

---

## 11. DoD (Profile Sprint)
- [ ] Signup cannot access platform until profile is created
- [ ] Unique username + 30-day cooldown
- [ ] Role shown everywhere (except anonymous posts/comments)
- [ ] Avatar stored as single WEBP 512×512
- [ ] Gender + DOB locked after creation

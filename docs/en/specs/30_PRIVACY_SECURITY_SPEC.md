# 30_PRIVACY_SECURITY_SPEC (EN)

## 0. Purpose
Product-level privacy and safety rules:
- privacy controls
- anti-troll / anti-harassment mechanisms
- safety UX principles
- reporting + blocking requirements

(Technical implementation lives in /docs.)

---

## 1. Full registration wall
- Non-registered users: **no access** to any content (posts, profiles, chat).
- Only after signup + profile creation: full access.

---

## 2. Seniority gating (anti-troll)
- Chat access may require minimum seniority (e.g., 7 days).
- UI must clearly communicate:
  - “Chat unlocks after X days”
  - countdown remaining

---

## 3. Anonymous mode is strictly limited
- Anonymous applies **only** to:
  - anonymous posts
  - anonymous comments
- Everywhere else: Username+Role is always visible.
- Admin can always resolve anonymous content to authorId.

---

## 4. Blocking is mutual
If A blocks B → both cannot see/interact with each other.

Minimum effects:
- No instant (purple) messages
- No inbox (red) messages
- Optional: hide posts/comments or show a placeholder (decide in Posts SPEC)

---

## 5. Reporting is mandatory
Reporting must be available from:
- user profile
- post/comment
- inbox (red) messages
- instant (purple) messages
- chat (lobby/rooms)

### 5.1 Report structure
- reason:
  - harassment
  - spam
  - impersonation
  - illegal content
  - non-consensual content
  - other (with text)
- optional free text (<=1000 chars)
- must include context ids (userId, messageId, postId, etc.)
- include a “Block user” quick action after submit (recommended)

---

## 6. Advanced privacy controls (mobile-first)
### 6.1 Screenshot discouragement (not a perfect block)
OS-level prevention is not guaranteed, but we can:
- detect screenshot events in app and show warnings
- optionally log suspicious patterns for admin review
- reinforce policy in ToS and make reporting easy

### 6.2 Anti-copy (optional)
- disable copy for sensitive areas
- subtle watermarks for sensitive screens

### 6.3 Online / last seen / messaging controls
User can control:
- show online status
- show last seen
- who can send purple/red messages (everyone / approved only / nobody)

---

## 7. Anti-troll locks (locked decisions)
- Gender immutable
- DOB/Age immutable
- Username change: once per 30 days + audit log

---

## 8. Data minimization
- Do not store unnecessary copies:
  - no avatar history
  - no duplicate image variants
  - store only what product needs

---

## 9. DoD (Privacy/Safety Product)
- [ ] Platform is hidden unless registered + profile completed
- [ ] Anonymous only for posts/comments
- [ ] Mutual blocking works across channels
- [ ] Reporting available everywhere needed
- [ ] Basic privacy toggles defined

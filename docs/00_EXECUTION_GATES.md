# NADU — Execution Gates & Build Order
Version: v1.0
Status: Mandatory

This document defines the ONLY allowed execution order for building NADU.
No feature, code, or configuration may be added unless its gate is explicitly open.

This file is the operational authority for:
- Build order
- Security enforcement
- Scope control
- Validation
- Release readiness

--------------------------------------------------
GENERAL RULES
--------------------------------------------------

1. No skipping phases.
2. No implementation without a referenced document.
3. No feature without a Definition of Done (DoD).
4. No merge without passing the Gate validation checklist.
5. UI NEVER replaces security rules.
6. Firestore Rules are the final authority.
7. AI must not invent features, fields, or flows.

--------------------------------------------------
SPRINT 0 — FOUNDATION (LOCKED AFTER COMPLETION)
--------------------------------------------------

Objective:
Create a safe, documented, reproducible foundation.

Allowed Work:
- Project setup (Next.js / Firebase)
- Firebase configuration
- Firestore rules (existing)
- Emulator setup
- Documentation integration

Required Docs:
- 00_MASTER_CONTEXT.md
- 10_ARCHITECTURE.md
- 20_SECURITY.md
- 30_DATA_MODEL.md

Gate Validation Checklist:
- Firebase emulators run without errors
- firestore.rules dry-run passes
- No anonymous access possible
- Docs exist and are readable
- Repo clean and committed

Gate Status:
- Must be CLOSED before moving to Sprint 1

--------------------------------------------------
SPRINT 1 — AUTH & USER CORE
--------------------------------------------------

Objective:
Every user is authenticated, identified, and controlled.

Allowed Work:
- Firebase Auth (Email / Provider)
- User document creation on signup
- Role storage (user / admin)
- Auth guards (routing)

Required Docs:
- 20_SECURITY.md
- 30_DATA_MODEL.md
- 50_USER_FLOWS.md

DoD:
- User cannot access app without auth
- users/{uid} created exactly once
- User cannot escalate role
- Admin role read-only from UI

Gate Validation Checklist:
- Unauthenticated user blocked
- Authenticated user sees profile
- Firestore rules enforce ownership
- Role escalation attempt fails

--------------------------------------------------
SPRINT 2 — GROUPS & MEMBERSHIP
--------------------------------------------------

Objective:
Controlled communities with explicit membership.

Allowed Work:
- Create group
- Join / leave group
- Group visibility enforcement
- Group members subcollection

Required Docs:
- 30_DATA_MODEL.md
- 20_SECURITY.md
- 50_USER_FLOWS.md

DoD:
- Non-member cannot read private group
- Member can read/write allowed content
- Owner/moderator roles enforced

Gate Validation Checklist:
- Group visibility respected
- Membership checked in rules
- UI hides forbidden actions
- Direct Firestore access blocked if unauthorized

--------------------------------------------------
SPRINT 3 — POSTS, COMMENTS, REACTIONS
--------------------------------------------------

Objective:
Content is scoped, owned, and permissioned.

Allowed Work:
- Create/read posts
- Comments
- Reactions
- Group-scoped feeds

Required Docs:
- 30_DATA_MODEL.md
- 20_SECURITY.md
- 40_API_CONTRACTS.md

DoD:
- Only allowed users can read content
- Only author can edit/delete
- Content visibility enforced by rules

Gate Validation Checklist:
- Cross-group access blocked
- Post spoofing attempt fails
- UI + rules consistency verified

--------------------------------------------------
SPRINT 4 — CHATS & MESSAGING
--------------------------------------------------

Objective:
Private communication without leakage.

Allowed Work:
- Create/open chats
- Send messages
- Chat membership enforcement

Required Docs:
- 30_DATA_MODEL.md
- 20_SECURITY.md
- 50_USER_FLOWS.md

DoD:
- Only chat members can read/write
- Message size limits enforced
- No chat enumeration possible

Gate Validation Checklist:
- Non-member blocked
- Message spoof blocked
- Rules enforce membership

--------------------------------------------------
SPRINT 5 — ADMIN, MODERATION, GOVERNANCE
--------------------------------------------------

Objective:
Control without abuse.

Allowed Work:
- Admin tools
- Moderation actions
- Reports
- Soft deletes / visibility flags

Required Docs:
- 100_ADMIN_MOD_TOOLS.md
- 130_COMPLIANCE_TRUST.md

DoD:
- Admin powers explicit and logged
- No silent privilege escalation
- User trust preserved

Gate Validation Checklist:
- Admin-only paths protected
- Logs exist for actions
- No override of core rules

--------------------------------------------------
SPRINT 6 — PRODUCTION READINESS
--------------------------------------------------

Objective:
Safe release.

Allowed Work:
- Monitoring
- Backups
- Indexes
- CI/CD
- Release checklist

Required Docs:
- 60_PRODUCTION_READINESS.md
- 110_TESTING_QA.md
- 120_BACKUP_DR.md
- 160_MIGRATIONS_VERSIONING.md

DoD:
- All gates passed
- Rollback plan exists
- Monitoring active
- Release checklist completed

--------------------------------------------------
GLOBAL STOP CONDITIONS
--------------------------------------------------

STOP immediately if:
- A feature is requested without doc reference
- Rules and UI diverge
- Security behavior is unclear
- AI suggests “quick fix” bypassing rules
- A sprint gate is not satisfied

--------------------------------------------------
FINAL RULE
--------------------------------------------------

If in doubt:
STOP.
Document.
Validate.
Only then proceed.

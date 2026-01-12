# 90_MIGRATION_MAP — מה נשמר ומה נטמע (ללא כפילויות)
_גרסת GOLD: 2026-01-12_

## מה לשמור כעת
- כל מה שבתיקייה הזאת (`/specs` + `/docs`) הוא ה‑SSOT החדש.

## מיפוי קבצים ישנים → לאן נכנסו

- `docs/10_ARCHITECTURE.md` → `docs/10_ARCHITECTURE.md`
- `docs/20_SECURITY.md` → `specs/02_SECURITY_PRIVACY.md + docs/20_FIREBASE.md + docs/30_BACKEND.md`
- `docs/30_DATA_MODEL.md` → `specs/03_DATA_MODEL.md`
- `docs/40_API_CONTRACTS.md` → `docs/30_BACKEND.md (endpoints list)`
- `docs/CORE_PRINCIPLES.md` → `specs/01_PRODUCT_RULES.md`
- `docs/00_EXECUTION_GATES.md` → `specs/00_SCOPE_MVP.md + docs/50_RUNBOOK.md`
- `docs/NADU_DEV_SETUP_GUIDE.md` → `docs/20_FIREBASE.md + docs/50_RUNBOOK.md`
- `docs/110_TESTING_QA.md` → `docs/50_RUNBOOK.md (smoke tests)`
- `docs/120_BACKUP_DR.md` → `specs/02_SECURITY_PRIVACY.md (P1) + future`

## קבצים ישנים — סטטוס
- כל שאר ה‑MD מהחבילה הישנה מסומנים כ־**MERGED/DEPRECATED** (לא לשימוש בפיתוח).
- אם אתה רוצה, אפשר להשאיר אותם בתיקייה `/legacy_docs` רק לצורך היסטוריה — אבל **לא להפנות אליהם**.

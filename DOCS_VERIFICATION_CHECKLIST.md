# NADU Docs Verification Checklist (Local + Git)

## Required files (minimum)
- README.md (root)
- docs/00_EXECUTION_GATES.md
- docs/10_ARCHITECTURE.md
- docs/20_SECURITY.md
- docs/30_DATA_MODEL.md
- docs/40_API_CONTRACTS.md
- docs/110_TESTING_QA.md
- docs/120_BACKUP_DR.md
- docs/130_COMPLIANCE_TRUST.md

## Local verification (PowerShell)
```powershell
cd C:\Users\User\Documents\GitHub\nadu-chatgpt

# List docs files
Get-ChildItem .\docs -Recurse -File | Select FullName, Length

# Verify critical docs exist
$req = @(
  "README.md",
  "docs\00_EXECUTION_GATES.md",
  "docs\10_ARCHITECTURE.md",
  "docs\20_SECURITY.md",
  "docs\30_DATA_MODEL.md",
  "docs\40_API_CONTRACTS.md"
)
$missing = $req | Where-Object { -not (Test-Path $_) }
if($missing.Count -eq 0){ "✅ Docs OK" } else { "❌ Missing:`n$($missing -join "`n")" }

# Detect suspiciously tiny docs (likely placeholders)
Get-ChildItem .\docs -Recurse -File | Where-Object { $_.Length -lt 200 } | Select FullName, Length
```

## Git verification
```powershell
git status
git add docs README.md
git status
git commit -m "docs: update full documentation set"
git push origin main

# Confirm last commit includes docs
git log -1 --name-only
```

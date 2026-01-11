# ===============================
# NADU – Populate Specs Script
# ===============================

$basePath = "docs/specs"

# מפת קבצים -> תוכן
$files = @{
    "00_MASTER_CONTEXT.md" = @"
# 00 – MASTER CONTEXT

## Purpose
This document defines the master context for the NADU platform.

## Vision
NADU is a mobile-first, privacy-focused adult community platform.

## Core Principles
- Safety first
- Consent-driven interactions
- Privacy by design
- Clear separation between SPECS (what/why) and DOCS (how)

## Scope
This document is authoritative and overrides any conflicting spec.
"@

    "10_ONBOARDING_SPEC.md" = @"
# 10 – ONBOARDING SPEC

## Goal
Define a strict onboarding flow for new and existing users.

## Registration Methods
- Username + Password + Phone verification
- Google OAuth
- Apple Sign-In

## Rules
- Age 18+ mandatory
- Profile creation is mandatory after registration
- No access to content before profile completion
"@

    "20_PROFILE_SPEC.md" = @"
# 20 – PROFILE SPEC

## Purpose
Define user profile structure, editing rules, and visibility.

## Immutable Fields
- Gender
- Date of birth

## Editable Fields
- Username (change allowed every 30 days)
- Role
- Bio (max 1000 characters)

## Roles
Roles are gender-aware and displayed accordingly.

## Visibility
Username and role appear everywhere except anonymous posts.
"@
}

# יצירת תיקייה אם לא קיימת
if (-not (Test-Path $basePath)) {
    New-Item -ItemType Directory -Path $basePath | Out-Null
}

# כתיבת הקבצים
foreach ($file in $files.Keys) {
    $fullPath = Join-Path $basePath $file
    $files[$file] | Set-Content -Path $fullPath -Encoding UTF8
    Write-Host "Wrote: $fullPath"
}

Write-Host "Done. Files populated successfully."

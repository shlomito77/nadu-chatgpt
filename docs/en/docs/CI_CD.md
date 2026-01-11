# CI/CD

**Last updated:** 2026-01-07  
**Type:** HOW

## 1. Branching
- dev: active development
- main: stable releases

## 2. Pipelines (minimum)
- Lint + typecheck
- Unit tests (functions)
- Build (functions)
- Deploy (manual approval for main)

## 3. Environments
- Local: Firebase emulators
- Staging: separate Firebase project
- Prod: separate Firebase project


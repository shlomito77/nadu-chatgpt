# Phase C — CI/CD Execution

## Branching
- dev = עבודה שוטפת
- main = יציב בלבד
- feature/* = עבודה ממוקדת

## CI (GitHub Actions)
- lint
- build
- test
- (optional) emulator integration tests

## CD
- Staging deploy (optional early)
- Production deploy only from main + tagged release

## Release Flow
1) merge to dev
2) nightly build/tests
3) promote to main
4) tag release
5) deploy

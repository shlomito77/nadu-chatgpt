# Environments & deployment

## Environments
- local (emulators)
- staging (restricted testers)
- prod

## Secrets
- use Google Secret Manager for API keys (push, moderation tools).

## Release strategy
- merge to main triggers CI
- deploy to staging first
- tag release for production deploy

# Phase C — Risk Register

## R1: Abuse/harassment in DM/chat
- Mitigation: report+moderation, rate limits, tenure gating, block system

## R2: Cost blowups (Firestore reads)
- Mitigation: query limits, pagination, denormalized counters, aggressive caching

## R3: Privacy leaks (screenshots)
- Mitigation: policy + deterrence UI, watermarking, optional secure view (platform-native), report flow

## R4: Auth provider complexity (Apple/Phone)
- Mitigation: implement early (Sprint 1), thorough E2E

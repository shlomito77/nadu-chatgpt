# 70 — Scaling & Performance

**Last updated:** 2026-01-07  
**Type:** HOW

## 1. Cost-aware defaults (Firestore)
- Denormalize counts (likeCount/commentCount) to avoid heavy aggregations.
- Paginate everywhere (feed, comments, DM threads).
- Use composite indexes for common queries.
- Avoid “fan-out writes” in v1.

## 2. Media
- Store in Cloud Storage (not Firestore).
- Use resized variants (mobile sizes) to reduce egress.

## 3. Chat cost control
- Prefer session-based querying (“since sessionStart”).
- Add TTL cleanup only if needed.

## 4. Observability
- Cloud Logging for functions
- Basic dashboards: errors, latency, writes/day.


# Storage & media

## Storage buckets
- `avatars/uid/...`
- `postMedia/postId/...`
- `profileMedia/uid/...`

## Upload model (recommended)
1. Client requests an upload URL via Function `mediaCreateUploadUrl`.
2. Server returns signed URL + expected object path.
3. Client uploads directly to Storage.
4. Storage finalize trigger validates file (type/size), writes media doc, runs blur pipeline if needed.

## Constraints (recommended defaults)
- avatar: square crop; max 1024px; store webp/jpg; limit size (e.g., 1–2MB).
- post media: limit count per post; max size per file; allow images (phase 1); video later.

## Privacy
- Storage rules: only owner can upload; public read depends on visibility flags stored in Firestore and mirrored as custom metadata.

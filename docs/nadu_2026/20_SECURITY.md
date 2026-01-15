# 20_SECURITY.md
_עודכן לאחרונה: 2026-01-08_

## Critical Security Requirements (P0)
🚨 **דרישות חסימה - אין קוד ללא אלו:**

1. ✅ **Firebase App Check** (Cloudflare Turnstile) - חובה לפני כל API call
2. ✅ **Custom Claims** - Authorization ב-token (NO `get()` in Security Rules)
3. ✅ **GCP Secret Manager** - ALL secrets (API keys, tokens, service accounts)
4. ✅ **Composite Indexes** - מוגדרים מראש ב-`firestore.indexes.json`
5. ✅ **Hebrew RTL** - CSS Logical Properties בלבד (`inline-start`, לא `left`)

---

## מטרה
להגדיר את שכבות האבטחה של NADU: Authentication, Authorization, Firestore Rules, Functions Hardening, Data Protection.

זה מסמך **HOW** (מימוש אבטחה).

---

## 1. עקרונות אבטחה

### Default Deny
- משתמשים לא מאומתים: אין גישה לכלום
- משתמשים מאומתים: גישה מינימלית בלבד
- Admin/Moderator: גישה מלאה עם audit log

### Least Privilege
- Clients קוראים רק מה שמותר להם
- Clients לא כותבים ישירות ל-Firestore (רק דרך Functions)
- Custom Claims מגדירים הרשאות ב-token

### Server-Authoritative
```typescript
// ❌ לא נכון - Client כותב ישירות
await setDoc(doc(db, 'posts', postId), { ... });

// ✅ נכון - דרך Cloud Function
await fetch('/api/posts/create', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${idToken}` },
  body: JSON.stringify(postData)
});
```

### Auditability
- כל פעולת מודרציה נרשמת ב-`moderationActions`
- דיווחים נשמרים עם snapshots של התוכן
- Admin actions עם timestamp + actor + reason

---

## 2. Authentication & Identity

### Firebase Auth Providers
```yaml
Enabled:
├── Email/Password + Phone Verification (primary)
├── Google Sign-In (secondary)
└── Apple Sign-In (secondary)

Disabled:
- Facebook (privacy concerns)
- Twitter/X
- Anonymous auth (except for posts content)
```

### Age Verification (18+)
```typescript
// functions/src/auth/onUserCreate.ts
export const onUserCreate = onDocumentCreated('users/{uid}', async (event) => {
  const user = event.data.data();
  const age = calculateAge(user.dob);

  if (age < 18) {
    // Delete user immediately
    await admin.auth().deleteUser(event.params.uid);
    throw new HttpsError('failed-precondition', 'Must be 18+');
  }

  // Set Custom Claims
  await admin.auth().setCustomUserClaims(event.params.uid, {
    role: 'user',
    verified: false,
    tenureDays: 0
  });
});
```

### Custom Claims Structure
```typescript
interface CustomClaims {
  role: 'user' | 'moderator' | 'admin';
  verified?: boolean;           // Verified badge
  premium?: boolean;            // Premium subscription
  tenureDays: number;           // Days since registration
  banned?: boolean;             // Banned user
}

// עדכון Claims
await admin.auth().setCustomUserClaims(uid, {
  role: 'admin',
  verified: true,
  tenureDays: 150
});
```

---

## 3. Firestore Security Rules

### Posture: Restrictive
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }

    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }

    function isBanned() {
      return isAuthenticated() && request.auth.token.banned == true;
    }

    function hasMinimumTenure(days) {
      return isAuthenticated() && request.auth.token.tenureDays >= days;
    }

    // Users collection
    match /users/{uid} {
      allow read: if isAuthenticated() && !isBanned();
      allow write: if false; // ALWAYS use Functions
    }

    // Posts collection
    match /posts/{postId} {
      allow read: if isAuthenticated()
        && !isBanned()
        && (resource.data.visibility == 'public'
            || hasRole('admin')
            || hasRole('moderator'));

      allow write: if false; // ALWAYS use Functions
    }

    // Comments subcollection
    match /posts/{postId}/comments/{commentId} {
      allow read: if isAuthenticated() && !isBanned();
      allow write: if false;
    }

    // Chats collection
    match /chats/{chatId} {
      allow read: if isAuthenticated()
        && !isBanned()
        && (resource.data.type == 'lobby'
            || request.auth.uid in resource.data.participants);

      allow write: if false;
    }

    // Messages subcollection
    match /chats/{chatId}/messages/{messageId} {
      allow read: if isAuthenticated()
        && !isBanned()
        && hasMinimumTenure(7); // 7-day tenure for chat

      allow write: if false;
    }

    // Mailbox threads
    match /mailboxThreads/{threadId} {
      allow read: if isAuthenticated()
        && !isBanned()
        && request.auth.uid in resource.data.participants;

      allow write: if false;
    }

    // Reports (moderators only)
    match /reports/{reportId} {
      allow read: if hasRole('admin') || hasRole('moderator');
      allow write: if false;
    }

    // Moderation actions (admin audit log)
    match /moderationActions/{actionId} {
      allow read: if hasRole('admin') || hasRole('moderator');
      allow write: if false;
    }
  }
}
```

### Critical Rules
```javascript
// ❌ לעולם לא לעשות:
allow write: if request.auth.uid == resource.data.authorUid;
// סיבה: Client יכול לזייף authorUid

// ✅ במקום:
allow write: if false; // רק Functions
```

---

## 4. Cloud Functions Hardening

### Token Verification
```typescript
// functions/src/shared/auth.ts
export async function verifyToken(req: Request): Promise<DecodedIdToken> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HttpsError('unauthenticated', 'Missing token');
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // Check App Check token
    const appCheckToken = req.headers['x-firebase-appcheck-token'];
    if (!appCheckToken) {
      throw new HttpsError('unauthenticated', 'Missing App Check token');
    }

    await admin.appCheck().verifyToken(appCheckToken);

    return decoded;
  } catch (error) {
    throw new HttpsError('unauthenticated', 'Invalid token');
  }
}
```

### Input Validation
```typescript
import Joi from 'joi';

const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(10).max(10000).required(),
  forumId: Joi.string().optional(),
  isAnonymous: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string()).max(5).optional()
});

export async function validateInput(data: any, schema: Joi.Schema) {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new HttpsError('invalid-argument', error.message);
  }
  return value;
}
```

### Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
}

export function sanitizeText(text: string): string {
  // Remove script tags, SQL injection attempts, etc.
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}
```

### Rate Limiting
```typescript
// Rate limit by UID
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  uid: string,
  limit: number,
  windowMs: number
): Promise<void> {
  const now = Date.now();
  const key = `${uid}`;
  const record = rateLimits.get(key);

  if (!record || now > record.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (record.count >= limit) {
    throw new HttpsError(
      'resource-exhausted',
      `Rate limit exceeded. Try again in ${Math.ceil((record.resetAt - now) / 1000)}s`
    );
  }

  record.count++;
}

// Usage:
await checkRateLimit(user.uid, 10, 60 * 1000); // 10 requests per minute
```

---

## 5. Abuse & Safety

### Reporting Pipeline
```typescript
// POST /api/reports/create
export const createReport = onCall(async (request) => {
  const user = await verifyToken(request);
  const data = await validateInput(request.data, reportSchema);

  // Rate limit: 5 reports per hour
  await checkRateLimit(user.uid, 5, 60 * 60 * 1000);

  const reportId = generateId();

  // Take snapshot of reported content
  const evidence = await captureEvidence(data.targetType, data.targetId);

  await db.collection('reports').doc(reportId).set({
    reportId,
    reporterUid: user.uid,
    reporterUsername: user.username,
    targetType: data.targetType,
    targetId: data.targetId,
    category: data.category,
    description: sanitizeText(data.description),
    evidence,
    status: 'open',
    createdAt: FieldValue.serverTimestamp()
  });

  return { reportId, status: 'open' };
});
```

### Blocking System
```typescript
// Mutual blocking enforced
export async function checkBlocked(uid1: string, uid2: string): Promise<boolean> {
  const blocksRef = db.collection('blocks');

  const [block1, block2] = await Promise.all([
    blocksRef.where('blockerUid', '==', uid1).where('blockedUid', '==', uid2).get(),
    blocksRef.where('blockerUid', '==', uid2).where('blockedUid', '==', uid1).get()
  ]);

  return !block1.empty || !block2.empty;
}

// Usage in sendMessage:
if (await checkBlocked(senderUid, recipientUid)) {
  throw new HttpsError('permission-denied', 'Cannot send message');
}
```

### Admin Visibility
```typescript
// Admin can see anonymous authors
export async function getPostWithAuthor(postId: string, viewerUid: string): Promise<Post> {
  const post = await db.collection('posts').doc(postId).get();
  const postData = post.data() as Post;

  const viewer = await admin.auth().getUser(viewerUid);
  const isAdmin = viewer.customClaims?.role === 'admin';

  if (!isAdmin && postData.isAnonymous) {
    // Hide author for regular users
    return {
      ...postData,
      authorUid: 'anonymous',
      authorUsername: 'Anonymous'
    };
  }

  return postData; // Admin sees real author
}
```

---

## 6. Data Protection

### PII Minimization
```typescript
// Store only what's needed
interface User {
  uid: string;
  email: string;           // ✅ Required
  phoneNumber?: string;    // ✅ Optional, hashed
  username: string;        // ✅ Public
  // ❌ NO: Full name, address, SSN, credit card
}

// Hash phone numbers
import crypto from 'crypto';

export function hashPhone(phone: string): string {
  return crypto.createHash('sha256').update(phone).digest('hex');
}
```

### Cloud Storage Security
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Profile photos
    match /users/{uid}/photos/{photoId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid
        && request.resource.size < 5 * 1024 * 1024  // 5MB
        && request.resource.contentType.matches('image/.*');
    }

    // Post media
    match /posts/{postId}/media/{mediaId} {
      allow read: if request.auth != null;
      allow write: if false; // Upload via Functions
    }

    // Private photos (require permission)
    match /users/{uid}/private/{photoId} {
      allow read: if request.auth.uid == uid
        || hasPermission(uid, request.auth.uid);
      allow write: if request.auth.uid == uid;
    }
  }
}
```

### Signed URLs
```typescript
// Generate signed URL for private content
export async function getSignedUrl(
  filePath: string,
  expiresInMinutes: number = 15
): Promise<string> {
  const bucket = admin.storage().bucket();
  const file = bucket.file(filePath);

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000
  });

  return url;
}
```

---

## 7. HTTPS & Encryption

### All Traffic Encrypted
- Firebase Hosting: automatic HTTPS
- Cloud Functions: HTTPS only
- Firestore: encrypted at rest + in transit

### Certificate Pinning (Future)
```typescript
// Mobile apps: pin Firebase certificates
// Prevents MITM attacks
```

---

## 8. Monitoring & Incident Response

### Logging
```typescript
import { logger } from 'firebase-functions/v2';

export async function moderateContent(actionData: any) {
  logger.info('Moderation action', {
    actorUid: actionData.actorUid,
    targetUid: actionData.targetUid,
    actionType: actionData.actionType,
    timestamp: new Date().toISOString()
  });

  // Perform action...
}
```

### Alerts
```yaml
Setup alerts for:
├── Unusual spikes in reports
├── Multiple failed auth attempts
├── Rate limit violations
├── Function errors/crashes
└── Suspicious data access patterns
```

---

## Definition of Done

Security מוכן כאשר:
- ✅ App Check מופעל בפרודקשן
- ✅ Custom Claims מוגדרים לכל משתמש
- ✅ Security Rules נבדקו באמולטור
- ✅ Functions מאמתים tokens
- ✅ Input validation בכל endpoint
- ✅ Rate limits מוטמעים
- ✅ GCP Secret Manager מכיל כל secrets
- ✅ Logging & Monitoring פועלים

---

## הערות

- Security is NOT negotiable - אין פשרות
- כל שינוי ב-Rules דורש review וב testing
- Penetration testing לפני Production
- Security audit כל 6 חודשים

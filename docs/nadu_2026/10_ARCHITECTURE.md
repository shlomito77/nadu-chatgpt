# 10_ARCHITECTURE.md
_עודכן לאחרונה: 2026-01-08_

## מטרה
להגדיר את הארכיטקטורה הטכנית של NADU: Next.js 15 + Firebase, כולל שכבות, תזרימי נתונים, אבטחה, ו-RTL.

זה מסמך **HOW** (איך בונים את המערכת).

---

## עקרונות ארכיטקטוניים

### 1. Frontend: Next.js 15 App Router
- **Server Components by default** - רנדור שרתי כברירת מחדל
- **Client Components** - רק לאינטראקטיביות (`'use client'`)
- **React 19** - Streaming SSR, Suspense
- **Tailwind CSS v4** - CSS Logical Properties לעברית
- **TypeScript strict mode** - אכיפה מלאה

### 2. Backend: Firebase
```yaml
Services:
├── Firebase Auth: Email/Password + Phone + Google + Apple
├── Firestore: Database (NoSQL, realtime)
├── Cloud Storage: תמונות, קבצים
├── Cloud Functions (2nd gen): Mutations API
├── Firebase Hosting: Frontend deployment
└── App Check: Bot protection (Cloudflare Turnstile)
```

### 3. Security-first
- **Custom Claims** - Authorization ב-token, לא `get()` ב-Rules
- **Server mutations** - כל שינוי דרך Functions
- **GCP Secret Manager** - כל secrets (API keys, tokens)
- **Composite Indexes** - מוגדרים מראש ב-`firestore.indexes.json`

### 4. Mobile-first + RTL
- **360x800** - מינימום רזולוציה
- **CSS Logical Properties** - `inline-start/end`, לא `left/right`
- **Touch targets** - מינימום 44x44px
- **עברית** - כיוון RTL כברירת מחדל

---

## שכבות המערכת

```
┌─────────────────────────────────────────┐
│          Client (Next.js 15)           │
│  ┌────────────┐  ┌──────────────────┐  │
│  │   Pages    │  │  Components      │  │
│  │  (Routes)  │  │  (Server/Client) │  │
│  └────────────┘  └──────────────────┘  │
└─────────────────────────────────────────┘
              ↕ (Auth token)
┌─────────────────────────────────────────┐
│         Firebase Services              │
│  ┌──────────┐  ┌──────────────────┐   │
│  │   Auth   │  │    Firestore     │   │
│  │  (Users) │  │  (Read Direct)   │   │
│  └──────────┘  └──────────────────┘   │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ Functions│  │     Storage      │   │
│  │ (Write)  │  │  (Signed URLs)   │   │
│  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│         GCP Secret Manager             │
│  (API Keys, Service Accounts, Tokens)  │
└─────────────────────────────────────────┘
```

---

## תזרימי נתונים

### Read Path (קריאה)
```typescript
// Client → Firestore (ישיר)
const postsRef = collection(db, 'posts');
const q = query(postsRef,
  where('visibility', '==', 'public'),
  orderBy('createdAt', 'desc'),
  limit(20)
);
const snapshot = await getDocs(q);

// Security Rules מאשרות גישה
// Custom Claims מאפשרות admin visibility
```

### Write Path (כתיבה)
```typescript
// Client → Cloud Function → Firestore
const response = await fetch('/api/posts/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({
    title: 'כותרת',
    content: 'תוכן',
    forumId: 'forum-123',
    isAnonymous: false
  })
});

// Function:
// 1. אימות token
// 2. ולידציה
// 3. בדיקת הרשאות (Custom Claims)
// 4. כתיבה ל-Firestore
// 5. Audit log
```

---

## Next.js 15 Structure

```
/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── onboarding/page.tsx
│
├── (main)/
│   ├── layout.tsx              ← Tab Bar, RTL wrapper
│   ├── page.tsx                ← Home/Feed
│   ├── forums/
│   │   ├── [forumId]/page.tsx
│   │   └── [forumId]/[postId]/page.tsx
│   ├── chat/
│   │   ├── page.tsx            ← Lobby
│   │   └── [chatId]/page.tsx   ← Room/DM
│   ├── messages/
│   │   └── [threadId]/page.tsx ← Red messages
│   └── profile/
│       ├── page.tsx            ← View own profile
│       ├── edit/page.tsx
│       └── [userId]/page.tsx   ← View other profile
│
├── admin/
│   ├── layout.tsx              ← Auth guard (admin only)
│   ├── dashboard/page.tsx
│   └── moderation/page.tsx
│
└── api/
    └── (trpc or direct functions)
```

---

## Firebase Architecture

### Firestore Collections
```typescript
/users/{uid}                    // Identity + roles
/profiles/{uid}                 // Bio, preferences (optional split)
/posts/{postId}                 // Public posts
  /comments/{commentId}         // Nested comments
  /reactions/{uid}              // Likes/reactions
/chats/{chatId}                 // Lobby, rooms, DMs
  /members/{uid}
  /messages/{messageId}
/mailboxThreads/{threadId}      // Red messages
  /messages/{messageId}
/groups/{groupId}
  /members/{uid}
/reports/{reportId}             // User reports
/moderationActions/{actionId}   // Admin actions
```

### Security Rules Pattern
```javascript
// Firestore Rules
match /posts/{postId} {
  // קריאה: לפי visibility + Custom Claims
  allow read: if isAuthenticated()
    && (resource.data.visibility == 'public'
        || hasAdminClaim());

  // כתיבה: חסומה לחלוטין (רק דרך Functions)
  allow write: if false;
}

// Helper functions
function isAuthenticated() {
  return request.auth != null;
}

function hasAdminClaim() {
  return request.auth.token.role == 'admin';
}
```

### Cloud Functions Structure
```
/functions/
├── src/
│   ├── auth/
│   │   ├── onUserCreate.ts      // Custom Claims setup
│   │   └── verifyPhone.ts       // Phone verification
│   ├── posts/
│   │   ├── createPost.ts        // POST /api/posts
│   │   ├── updatePost.ts        // PATCH /api/posts/:id
│   │   └── deletePost.ts        // DELETE /api/posts/:id
│   ├── chat/
│   │   ├── sendMessage.ts       // POST /api/chat/:id/messages
│   │   └── joinRoom.ts          // POST /api/chat/:id/join
│   ├── moderation/
│   │   ├── createReport.ts      // POST /api/reports
│   │   └── moderateContent.ts   // POST /api/admin/moderate
│   └── shared/
│       ├── auth.ts              // Token verification
│       ├── validation.ts        // Input validation
│       └── errors.ts            // Error handling
└── package.json
```

---

## RTL Architecture

### CSS Logical Properties
```css
/* ❌ לא נכון */
.sidebar {
  float: left;
  margin-right: 20px;
}

/* ✅ נכון */
.sidebar {
  float: inline-start;
  margin-inline-end: 20px;
}
```

### Tailwind RTL Classes
```typescript
// Component עם RTL
<div className="
  flex
  flex-row-reverse     /* RTL: reverse direction */
  gap-4
  ps-6                 /* padding-inline-start */
  pe-4                 /* padding-inline-end */
">
  <Avatar />
  <Content />
</div>
```

### HTML Direction
```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
```

---

## State Management

### Client State
```typescript
// React Context for global state
// app/providers.tsx
'use client';

import { createContext } from 'react';

export const AuthContext = createContext<AuthState | null>(null);
export const UIContext = createContext<UIState | null>(null);

export function Providers({ children }) {
  return (
    <AuthContext.Provider value={authState}>
      <UIContext.Provider value={uiState}>
        {children}
      </UIContext.Provider>
    </AuthContext.Provider>
  );
}
```

### Server State (Firestore)
```typescript
// Real-time subscriptions
import { onSnapshot } from 'firebase/firestore';

useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'users', userId),
    (snapshot) => {
      setUser(snapshot.data());
    }
  );
  return unsubscribe;
}, [userId]);
```

---

## Performance Architecture

### Server Components Optimization
```typescript
// app/forums/[forumId]/page.tsx
// Server Component - renders on server
export default async function ForumPage({ params }) {
  // Fetch data on server
  const posts = await getPosts(params.forumId);

  return (
    <div>
      <ForumHeader /> {/* Server Component */}
      <PostList posts={posts}> {/* Server Component */}
        <InteractiveButton /> {/* Client Component */}
      </PostList>
    </div>
  );
}
```

### Streaming with Suspense
```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
    </div>
  );
}
```

### Image Optimization
```typescript
import Image from 'next/image';

// Automatic optimization + lazy loading
<Image
  src={user.photoURL}
  alt={user.displayName}
  width={100}
  height={100}
  placeholder="blur"
  blurDataURL={user.photoBlur}
/>
```

---

## Deployment Architecture

### Environments
```yaml
Development:
  Firebase Project: nadu-dev
  Domain: dev.nadu.app

Staging:
  Firebase Project: nadu-staging
  Domain: staging.nadu.app

Production:
  Firebase Project: nadu-prod
  Domain: nadu.app (or thecage.co.il)
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Firebase
        run: |
          npm install -g firebase-tools
          firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

---

## Monitoring & Observability

### Firebase Analytics
```typescript
import { logEvent } from 'firebase/analytics';

// Track user actions
logEvent(analytics, 'post_created', {
  forum_id: forumId,
  is_anonymous: isAnonymous
});
```

### Error Tracking
```typescript
import { captureException } from '@sentry/nextjs';

try {
  await createPost(data);
} catch (error) {
  captureException(error);
  throw error;
}
```

### Performance Monitoring
```typescript
import { trace } from 'firebase/performance';

const t = trace(performance, 'load_forum');
t.start();
await loadForum(forumId);
t.stop();
```

---

## Definition of Done

ארכיטקטורה מוכנה כאשר:
- ✅ Next.js 15 מותקן ועובד
- ✅ Firebase services מוגדרים
- ✅ App Check מופעל
- ✅ Custom Claims פועלים
- ✅ Security Rules נבדקו באמולטור
- ✅ Composite Indexes מועלים
- ✅ RTL עובד בכל הדפים
- ✅ CI/CD pipeline פועל
- ✅ סביבות dev/staging/prod מוגדרות

---

## הערות

- מסמך זה מתעדכן עם התקדמות הפרויקט
- שינויים ארכיטקטוניים דורשים עדכון PRD תחילה
- עקרונות אבטחה אינם ניתנים למשא ומתן

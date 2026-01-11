# 40_API_CONTRACTS.md
_עודכן לאחרונה: 2026-01-08_

## מטרה
להגדיר את החוזים (contracts) של כל Cloud Functions API endpoints: Request, Response, Errors, Rate Limits.

זה מסמך **HOW** (ממשק API מדויק).

---

## עקרונות API

### 1. Authentication
כל endpoint דורש Firebase ID token:
```typescript
Headers: {
  'Authorization': 'Bearer <idToken>'
}
```

### 2. Error Handling
```typescript
interface ApiError {
  code: 'BAD_REQUEST' | 'UNAUTHENTICATED' | 'PERMISSION_DENIED' | 
        'NOT_FOUND' | 'RATE_LIMIT' | 'INTERNAL';
  message: string;
  details?: Record<string, any>;
}

// HTTP Status Codes:
// 200: Success
// 400: Bad Request (validation error)
// 401: Unauthenticated
// 403: Permission Denied
// 404: Not Found
// 429: Rate Limit Exceeded
// 500: Internal Server Error
```

### 3. Rate Limits
```typescript
// Per user limits (tracked by UID)
Default: 100 requests/minute
Write operations: 10/minute
Reports: 5/hour
```

### 4. Validation
- Input validation בשרת
- Sanitization של HTML/text
- Length limits מאולצים
- Required fields נבדקים

---

## Auth APIs

### POST /auth/register
**Purpose:** הרשמת משתמש חדש

**Request:**
```typescript
interface RegisterRequest {
  email: string;              // Valid email
  password: string;           // Min 8 chars
  username: string;           // 3-20 chars, unique
  phoneNumber: string;        // E.164 format
  agreeToTerms: boolean;      // Must be true
}
```

**Response:**
```typescript
interface RegisterResponse {
  uid: string;
  email: string;
  username: string;
  requiresOnboarding: true;   // Always true for new users
  customToken?: string;       // For immediate sign-in
}
```

**Errors:**
- `EMAIL_ALREADY_EXISTS` - Email taken
- `USERNAME_TAKEN` - Username unavailable
- `INVALID_PHONE` - Phone format invalid
- `UNDER_AGE` - User under 18

**Rate Limit:** 3 attempts per hour per IP

---

### POST /auth/verify-phone
**Purpose:** אימות מספר טלפון ב-OTP

**Request:**
```typescript
interface VerifyPhoneRequest {
  phoneNumber: string;
  verificationCode: string;   // 6 digits
}
```

**Response:**
```typescript
interface VerifyPhoneResponse {
  verified: boolean;
  uid: string;
}
```

**Errors:**
- `INVALID_CODE` - Wrong verification code
- `CODE_EXPIRED` - Code older than 10 minutes

**Rate Limit:** 5 attempts per hour per phone

---

## Profile APIs

### POST /profile/create
**Purpose:** יצירת פרופיל (onboarding)

**Request:**
```typescript
interface CreateProfileRequest {
  sex: 'male' | 'female' | 'other';  // IMMUTABLE
  dob: string;                       // YYYY-MM-DD, IMMUTABLE
  role: 'dom' | 'sub' | 'switch' | 'curious' | 'other';
  region: string;                    // North, Center, South, etc.
  city?: string;
  bio?: string;                      // Max 1000 chars
  interests?: string[];              // Max 10
  photoFile?: File;                  // Max 5MB, JPG/PNG
}
```

**Response:**
```typescript
interface CreateProfileResponse {
  uid: string;
  username: string;
  profileComplete: true;
  photoURL?: string;
}
```

**Errors:**
- `INVALID_AGE` - Under 18
- `INVALID_PHOTO` - Wrong format/size
- `PROFILE_EXISTS` - Already has profile

---

### PATCH /profile/update
**Purpose:** עדכון פרופיל קיים

**Request:**
```typescript
interface UpdateProfileRequest {
  displayName?: string;
  role?: 'dom' | 'sub' | 'switch' | 'curious' | 'other';
  city?: string;
  bio?: string;
  interests?: string[];
  privacy?: {
    showCity?: boolean;
    allowDMs?: boolean;
    showOnlineStatus?: boolean;
  };
}
```

**Response:**
```typescript
interface UpdateProfileResponse {
  updated: true;
  profile: Partial<User>;
}
```

**Errors:**
- `IMMUTABLE_FIELD` - Tried to change sex/dob
- `VALIDATION_ERROR` - Invalid data

---

### PATCH /profile/change-username
**Purpose:** שינוי username (כל 30 יום)

**Request:**
```typescript
interface ChangeUsernameRequest {
  newUsername: string;        // 3-20 chars, Hebrew/English/digits
}
```

**Response:**
```typescript
interface ChangeUsernameResponse {
  username: string;
  nextChangeAllowed: Timestamp;  // +30 days
}
```

**Errors:**
- `USERNAME_TAKEN` - Already exists
- `COOLDOWN_ACTIVE` - Changed less than 30 days ago
- `INVALID_CHARS` - Invalid characters

---

## Posts APIs

### POST /posts/create
**Purpose:** יצירת פוסט חדש

**Request:**
```typescript
interface CreatePostRequest {
  title: string;              // Max 200 chars
  content: string;            // Max 10000 chars, Tiptap JSON
  forumId?: string;           // Optional forum
  type: 'forum' | 'blog' | 'seeking';
  tags?: string[];            // Max 5
  isAnonymous?: boolean;      // Default false
  visibility?: 'public' | 'members' | 'premium';
  mediaFiles?: File[];        // Max 5 images
}
```

**Response:**
```typescript
interface CreatePostResponse {
  postId: string;
  authorUid: string;
  title: string;
  createdAt: Timestamp;
  url: string;                // /forums/{forumId}/{postId}
}
```

**Errors:**
- `CONTENT_TOO_LONG` - Exceeded limits
- `INVALID_FORUM` - Forum doesn't exist
- `TENURE_REQUIRED` - User too new (if gated)

**Rate Limit:** 10 posts per hour

---

### PATCH /posts/{postId}/update
**Purpose:** עריכת פוסט (15 דקות)

**Request:**
```typescript
interface UpdatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
}
```

**Response:**
```typescript
interface UpdatePostResponse {
  postId: string;
  updated: true;
  editedAt: Timestamp;
}
```

**Errors:**
- `EDIT_WINDOW_EXPIRED` - More than 15 minutes passed
- `NOT_AUTHOR` - Not the post creator

---

### DELETE /posts/{postId}
**Purpose:** מחיקת פוסט

**Request:** Empty body

**Response:**
```typescript
interface DeletePostResponse {
  deleted: true;
  postId: string;
}
```

**Errors:**
- `NOT_AUTHOR` - Not the post creator
- `HAS_COMMENTS` - Can't delete post with comments (admin only)

---

### POST /posts/{postId}/comment
**Purpose:** הוספת תגובה לפוסט

**Request:**
```typescript
interface CreateCommentRequest {
  content: string;            // Max 2000 chars
  parentCommentId?: string;   // If reply to comment
  isAnonymous?: boolean;
}
```

**Response:**
```typescript
interface CreateCommentResponse {
  commentId: string;
  postId: string;
  depth: number;              // Nesting level
  createdAt: Timestamp;
}
```

**Errors:**
- `MAX_DEPTH_EXCEEDED` - More than 3 levels deep

**Rate Limit:** 30 comments per hour

---

### POST /posts/{postId}/react
**Purpose:** לייק/דיסלייק

**Request:**
```typescript
interface ReactRequest {
  type: 'like' | 'remove';
}
```

**Response:**
```typescript
interface ReactResponse {
  postId: string;
  liked: boolean;
  totalLikes: number;
}
```

---

## Chat APIs

### POST /chat/join-lobby
**Purpose:** כניסה ללובי ברירת המחדל

**Request:** Empty (authenticated)

**Response:**
```typescript
interface JoinLobbyResponse {
  chatId: string;
  type: 'lobby';
  canSend: boolean;           // Based on tenure (7 days)
  tenureRequired: boolean;
  daysRemaining?: number;
}
```

**Errors:**
- `TENURE_REQUIRED` - Less than 7 days registered

---

### POST /chat/create-room
**Purpose:** יצירת חדר צ'אט

**Request:**
```typescript
interface CreateRoomRequest {
  title: string;              // Max 100 chars
  description?: string;
  ephemeral?: boolean;        // Delete messages after N days
  retentionDays?: number;     // If ephemeral
  maxMembers?: number;
}
```

**Response:**
```typescript
interface CreateRoomResponse {
  chatId: string;
  title: string;
  createdBy: string;
  url: string;                // /chat/{chatId}
}
```

**Rate Limit:** 5 rooms per day

---

### POST /chat/{chatId}/send
**Purpose:** שליחת הודעה לצ'אט

**Request:**
```typescript
interface SendMessageRequest {
  text: string;               // Max 2000 chars
  replyToMessageId?: string;
  mediaFile?: File;           // Image attachment
}
```

**Response:**
```typescript
interface SendMessageResponse {
  messageId: string;
  chatId: string;
  senderUid: string;
  createdAt: Timestamp;
}
```

**Errors:**
- `BLOCKED` - Blocked by another user
- `NOT_MEMBER` - Not in room
- `TENURE_REQUIRED` - Too new to send

**Rate Limit:** 60 messages per minute (burst), 10/minute sustained

---

### POST /chat/{chatId}/join
**Purpose:** הצטרפות לחדר

**Request:** Empty

**Response:**
```typescript
interface JoinRoomResponse {
  joined: true;
  chatId: string;
  memberCount: number;
}
```

**Errors:**
- `ROOM_FULL` - Max members reached
- `INVITE_REQUIRED` - Private room

---

## Messages APIs (Red - Mailbox)

### POST /messages/send
**Purpose:** שליחת הודעה אדומה (mailbox)

**Request:**
```typescript
interface SendMailboxMessageRequest {
  recipientUid: string;
  subject?: string;           // Optional
  content: string;            // Max 5000 chars
  mediaFile?: File;
}
```

**Response:**
```typescript
interface SendMailboxMessageResponse {
  threadId: string;
  messageId: string;
  sentAt: Timestamp;
}
```

**Errors:**
- `BLOCKED` - Blocked by recipient
- `DMS_DISABLED` - Recipient disabled DMs

**Rate Limit:** 20 messages per hour

---

### GET /messages/threads
**Purpose:** קבלת רשימת threads

**Request:**
```typescript
interface GetThreadsRequest {
  limit?: number;             // Max 50, default 20
  cursor?: string;            // For pagination
}
```

**Response:**
```typescript
interface GetThreadsResponse {
  threads: MailboxThread[];
  nextCursor?: string;
  hasMore: boolean;
}
```

---

### POST /messages/{threadId}/reply
**Purpose:** תשובה ל-thread קיים

**Request:**
```typescript
interface ReplyToThreadRequest {
  content: string;
  mediaFile?: File;
}
```

**Response:**
```typescript
interface ReplyToThreadResponse {
  messageId: string;
  threadId: string;
  sentAt: Timestamp;
}
```

---

## Moderation APIs

### POST /reports/create
**Purpose:** דיווח על משתמש/תוכן

**Request:**
```typescript
interface CreateReportRequest {
  targetType: 'user' | 'post' | 'comment' | 'chatMessage' | 'dmMessage';
  targetId: string;
  category: 'harassment' | 'spam' | 'inappropriate' | 'illegal' | 'other';
  description: string;        // Max 1000 chars
}
```

**Response:**
```typescript
interface CreateReportResponse {
  reportId: string;
  status: 'open';
  createdAt: Timestamp;
}
```

**Rate Limit:** 5 reports per hour

---

### POST /admin/moderate
**Purpose:** פעולת מודרציה (admin/moderator only)

**Request:**
```typescript
interface ModerateRequest {
  targetUid: string;
  actionType: 'warn' | 'mute' | 'timeout' | 'ban' | 'shadowban';
  reason: string;
  duration?: number;          // Seconds (for timeout/mute)
  deleteContent?: boolean;
}
```

**Response:**
```typescript
interface ModerateResponse {
  actionId: string;
  targetUid: string;
  actionType: string;
  expiresAt?: Timestamp;
}
```

**Errors:**
- `NOT_AUTHORIZED` - Not admin/moderator
- `INVALID_DURATION` - Duration out of range

---

## Upload APIs

### POST /upload/profile-photo
**Purpose:** העלאת תמונת פרופיל

**Request:**
```typescript
// Form data
file: File                    // Max 5MB, JPG/PNG/WebP
```

**Response:**
```typescript
interface UploadPhotoResponse {
  photoURL: string;           // Cloud Storage signed URL
  thumbnail: string;          // 200x200 thumbnail
}
```

**Errors:**
- `FILE_TOO_LARGE` - > 5MB
- `INVALID_FORMAT` - Not image

**Rate Limit:** 10 uploads per day

---

### POST /upload/media
**Purpose:** העלאת מדיה לפוסט/הודעה

**Request:**
```typescript
// Form data
files: File[]                 // Max 5 files, 5MB each
```

**Response:**
```typescript
interface UploadMediaResponse {
  mediaRefs: {
    url: string;
    thumbnail?: string;
    type: 'image' | 'video';
  }[];
}
```

---

## Admin APIs

### GET /admin/dashboard
**Purpose:** סטטיסטיקות דשבורד

**Requires:** admin role

**Response:**
```typescript
interface DashboardStats {
  users: {
    total: number;
    active: number;
    new24h: number;
  };
  posts: {
    total: number;
    new24h: number;
  };
  reports: {
    open: number;
    pending: number;
  };
  activity: {
    messagesPerHour: number;
    postsPerDay: number;
  };
}
```

---

### GET /admin/users
**Purpose:** חיפוש משתמשים

**Requires:** admin role

**Request:**
```typescript
interface SearchUsersRequest {
  query?: string;             // Username/email search
  role?: string;
  banned?: boolean;
  limit?: number;
  cursor?: string;
}
```

**Response:**
```typescript
interface SearchUsersResponse {
  users: User[];
  nextCursor?: string;
  total: number;
}
```

---

## Webhooks (Future)

### POST /webhooks/stripe
**Purpose:** Stripe payment events

**Request:** Stripe webhook payload

**Response:**
```typescript
{ received: true }
```

---

## Rate Limits Summary

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/register` | 3 | 1 hour |
| `/auth/verify-phone` | 5 | 1 hour |
| `/posts/create` | 10 | 1 hour |
| `/posts/{id}/comment` | 30 | 1 hour |
| `/chat/{id}/send` | 60 burst, 10 sustained | 1 minute |
| `/messages/send` | 20 | 1 hour |
| `/reports/create` | 5 | 1 hour |
| `/upload/profile-photo` | 10 | 1 day |
| All other | 100 | 1 minute |

---

## Error Codes Reference

| Code | HTTP | Meaning |
|------|------|---------|
| `BAD_REQUEST` | 400 | Invalid input |
| `UNAUTHENTICATED` | 401 | Missing/invalid token |
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `RATE_LIMIT` | 429 | Too many requests |
| `INTERNAL` | 500 | Server error |

---

## Testing

### Local Development
```bash
# Start emulators
firebase emulators:start

# API endpoint
http://localhost:5001/nadu-dev/us-central1/api
```

### Staging
```
https://us-central1-nadu-staging.cloudfunctions.net/api
```

### Production
```
https://us-central1-nadu-prod.cloudfunctions.net/api
```

---

## Definition of Done

API Contracts מוכנים כאשר:
- ✅ כל endpoints מתועדים
- ✅ TypeScript interfaces כתובות
- ✅ Error codes מוגדרים
- ✅ Rate limits מוטמעים
- ✅ Authentication נבדק
- ✅ Validation עובד
- ✅ Tests כתובים

---

## הערות

- מסמך זה הוא החוזה הרשמי בין Frontend ל-Backend
- שינויים ב-API דורשים עדכון מסמך זה + CHANGELOG
- כל endpoint חייב לאמת token ולטפל בשגיאות
- Rate limits מתעדכנים לפי צורך בפרודקשן
